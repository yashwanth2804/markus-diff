import { execSync } from "child_process";
import fs from "node:fs";
import path from "node:path";

export function getCurrentBranch() {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
}

export function stashChanges() {
    try {
        execSync('git stash', { stdio: 'pipe' });
        return true;
    } catch (error) {
        return false;
    }
}

export function popStashedChanges() {
    try {
        execSync('git stash pop', { stdio: 'pipe' });
    } catch (error) {
        console.warn('Warning: Could not pop stashed changes');
    }
}

export function setupTemporaryMerge() {
    const currentBranch = getCurrentBranch();

    // Checkout master
    execSync('git checkout master', { stdio: 'pipe' });

    try {
        // Attempt merge without committing
        execSync(`git merge --no-commit --no-ff ${currentBranch}`, { stdio: 'pipe' });
        return true;
    } catch (error) {
        // If merge fails, abort and return to original branch
        execSync('git merge --abort', { stdio: 'pipe' });
        execSync(`git checkout ${currentBranch}`, { stdio: 'pipe' });
        return false;
    }
}

export function cleanupTemporaryMerge(originalBranch) {
    // Reset any merge changes
    execSync('git reset --merge', { stdio: 'pipe' });

    // Return to original branch
    execSync(`git checkout ${originalBranch}`, { stdio: 'pipe' });
}

export function getGitInfo() {
    try {
        const sourceBranch = getCurrentBranch();
        const lastCommit = execSync('git log -1 --format="%H|%s|%an|%ad"', { encoding: 'utf-8' }).trim();
        const [hash, subject, author, date] = lastCommit.split('|');

        // Get the merge base commit between current branch and master
        const mergeBase = execSync(`git merge-base ${sourceBranch} master`, { encoding: 'utf-8' }).trim();

        // Get number of commits ahead/behind master
        const ahead = execSync(`git rev-list ${mergeBase}..${sourceBranch} --count`, { encoding: 'utf-8' }).trim();
        const behind = execSync(`git rev-list ${mergeBase}..master --count`, { encoding: 'utf-8' }).trim();

        return {
            sourceBranch,
            targetBranch: 'master',
            branchStatus: {
                ahead: parseInt(ahead),
                behind: parseInt(behind),
                mergeBase: mergeBase.substring(0, 8) // First 8 chars of merge-base hash
            },
            lastCommit: {
                hash,
                subject,
                author,
                date
            }
        };
    } catch (error) {
        console.warn('Warning: Could not get complete Git info:', error.message);
        return null;
    }
} 