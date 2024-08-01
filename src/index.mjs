import fs from 'fs';
import path from 'path';
import axios from 'axios';
import semver from 'semver';

import { extractNewChanges, readLogFile, extractRelease, getVersion } from './extractBreakingChanges.mjs';
import { createNewBranch, setupUser, handleNewPR} from './gitUtils.mjs';

// GitHub API URL for releases
// NOTE: Should have 1 for each rust, ts, sway
const tsApiUrl = 'https://api.github.com/repos/FuelLabs/fuels-ts/releases';

// Path to the breaking changes file
const tsFilePath = path.join(process.cwd(), 'docs/src/migrations/typescript-sdk.md');

main();

async function main() {
    const isWorkflow = process.argv.includes('--from-workflow');

    let branchName = null;

    if (isWorkflow) {
        console.log('SETTING UP GIT USER');
        await setupUser();
    }

    // Extract TS SDK
    await extractRelease(tsApiUrl, tsFilePath, "ts");

    // if (isWorkflow) {
    //     // create a new branch of docs-hub
    //     console.log('CREATING A NEW BRANCH');
    //     branchName = await createNewBranch();
    // }

    // if (isWorkflow) {
    //     // create a new PR
    //     console.log('CREATING A NEW PR');
    //     await handleNewPR(branchName);
    // }
    // edit versions file
}
