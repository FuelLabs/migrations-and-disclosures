import fs from 'fs';
import path from 'path';
import axios from 'axios';
import semver from 'semver';

// Path to the file storing the latest version processed
const versionFilePath = path.join(process.cwd(), 'src/versions.json');

export async function getVersion(latestVersionFilePath, languageType) {
    try {
        let startingVersion = 'v0.0.0';

        // Check if the file exists and read the content
        if (fs.existsSync(latestVersionFilePath)) {
            startingVersion = fs.readFileSync(latestVersionFilePath, 'utf8').trim();
        }

        const versionJson = JSON.parse(startingVersion);
        console.log('Parsed version JSON:', versionJson);

        // Return the version for the specified language type
        if (versionJson.default && versionJson.default[languageType]) {
            return versionJson.default[languageType];
        } else {
            throw new Error(`Version for language type "${languageType}" not found.`);
        }
    } catch (error) {
        console.error("Error reading the JSON file:", error);
        throw error;
    }
}

// Extract Releases
export async function extractRelease(moduleApiUrl, moduleFilePath, language) {
    try {
        let currFileContent = await readLogFile(moduleFilePath);
        let currVersion = await getVersion(versionFilePath, language);

        const response = await axios.get(moduleApiUrl);
        const releases = response.data;

        // Filter releases to include only those after the starting version
        const filteredReleases = releases.filter(release => {
            return semver.gt(release.tag_name, currVersion);
        });

        // Extract the new changes
        const newChanges = await extractNewChanges(currFileContent, filteredReleases, currVersion, language);

        if (newChanges) {
            currFileContent = currFileContent.split('\n');
            const title = currFileContent[0];
            const remainingContent = currFileContent.slice(1).join('\n');
            const updatedContent = title + '\n\n' + newChanges + remainingContent;
            fs.writeFileSync(moduleFilePath, updatedContent);
            console.log('Breaking changes updated in file:', moduleFilePath);
        }
    } catch (error) {
        console.error("Error extracting releases:", error);
        throw error;
    }
}

// Read the existing log file
export async function readLogFile(logFilePath) {
    let logFileContent = '';
    if (fs.existsSync(logFilePath)) {
        logFileContent = fs.readFileSync(logFilePath, 'utf8');
    }
    return logFileContent;
}

// Function to extract new changes from release data
export async function extractNewChanges(logContent, releases, startingVersion, language) {
    let newEntries = '';
    const logEntries = logContent.split('\n').filter(line => line.startsWith('Release'));
    let latestVersion = startingVersion;

    releases.forEach(release => {
        const breakingChangesSection = extractBreakingChanges(release.body);
        const releaseDate = new Date(release.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        if (breakingChangesSection && !logEntries.includes(`Release [${release.tag_name}](${release.html_url})`)) {
            newEntries = `## ${releaseDate}\n\n[Release ${release.tag_name}](${release.html_url})\n${breakingChangesSection}\n` + newEntries;
            if (semver.gt(release.tag_name, latestVersion)) {
                latestVersion = release.tag_name;
            }
        }
    });

    // Filter out specific sections
    const filteredEntries = filterOutSections(newEntries);

    // Update the latest version for the specific language
    await updateVersionFile(language, latestVersion);

    return filteredEntries;
}

// Function to filter out specific sections from the entries
function filterOutSections(content) {
    const sectionsToExclude = ['## Features', '## Fixes', '## Chores', '## Docs', '## CI', '## Misc'];
    return content.split('\n').filter(line => !sectionsToExclude.some(section => line.startsWith(section))).join('\n');
}

// Function to update the version file for a specific language
async function updateVersionFile(language, latestVersion) {
    try {
        let versionData = { default: {} };

        // Read existing version file if it exists
        if (fs.existsSync(versionFilePath)) {
            const versionContent = fs.readFileSync(versionFilePath, 'utf8');
            versionData = JSON.parse(versionContent);
        }

        // Update the specific language version
        versionData.default[language] = latestVersion;

        // Write the updated content back to the file
        fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2), 'utf8');
        console.log('Updated latest version for language:', language, 'to:', latestVersion);
    } catch (error) {
        console.error("Error updating the version file:", error);
        throw error;
    }
}

// Function to extract the "Breaking Changes" section from the release notes
export function extractBreakingChanges(content) {
    const lines = content.split('\n');
    const startIndex = lines.findIndex(line => line.trim() === '# Migration Notes');

    if (startIndex === -1) return null;

    const endIndex = lines.slice(startIndex + 1).findIndex(line => line.startsWith('# '));
    const endPosition = endIndex === -1 ? lines.length : startIndex + 1 + endIndex;

    // Extract the section content
    let sectionContent = lines.slice(startIndex + 1, endPosition).join('\n').trim();

    // Replace all `###` subtitles with the desired format
    sectionContent = sectionContent.replace(/^### \[(#\d+) - (.+?)\]\((.+?)\)/gm, (match, prNumber, title, url) => {
        return `### ${title} - [${prNumber}](${url})`;
    });

    // Ensure there is a blank line before each `###` subtitle
    sectionContent = sectionContent.replace(/(^|\n)(### .+)/g, (match, newline, subtitle) => {
        return `${newline.trim()}\n\n${subtitle}`;
    }).trim();

    return sectionContent;
}
