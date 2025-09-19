import team from '../team.json' assert { type: 'json' };

const GITLAB_API_URL = 'https://gitlab.com/api/v4';
export const users: GitlabUser[] = team || [];

export interface GitlabUserSummary {
    user: GitlabUser;
    commits: { project: GitlabProject; commits: GitlabCommit[] }[];
    mergeRequests: {
        author: GitlabMergeRequest[];
        reviewer: GitlabMergeRequest[];
    }
}

export interface GitlabUser {
    id: number;
    username: string;
    public_email: string;
    name: string;
    state: string;
    locked: boolean;
    avatar_url: string;
    web_url: string;
}

// Add these interfaces and functions to your util/gitlab.ts file:

export interface GitlabCommit {
    id: string;
    short_id: string;
    title: string;
    message: string;
    author_name: string;
    author_email: string;
    authored_date: string;
    committer_name: string;
    committer_email: string;
    committed_date: string;
    created_at: string;
    parent_ids: string[];
    web_url: string;
}

export interface GitlabMergeRequest {
    id: number;
    title: string;
    description: string;
    state: string;
    created_at: string;
    author: GitlabUser;
    source_branch: string;
    target_branch: string;
    upvotes: number;
    downvotes: number;
    merged_by: GitlabUser | null;
    merged_at: string | null;
    closed_by: GitlabUser | null;
    closed_at: string | null;
    web_url: string;
}

export interface GitlabProject {
    id: number;
    name: string;
    description: string;
    web_url: string;
    path_with_namespace: string;
    default_branch: string;
}

// Get all projects for a user
async function getGitlabUserProjects(userId: number): Promise<GitlabProject[]> {
    const fetchUrl = `${GITLAB_API_URL}/users/${userId}/contributed_projects`;
    const response = await fetch(fetchUrl, {
        headers: {
            'Authorization': `Bearer ${process.env.GITLAB_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
}

// Get commits for a specific project with date filtering and pagination
async function getProjectCommitsSince(
    projectId: number, 
    author: string, 
    sinceDate: string,
    toDate?: string,
    page: number = 1,
    perPage: number = 100
): Promise<GitlabCommit[]> {
    const params = new URLSearchParams({
        author: author,
        since: sinceDate,
        until: toDate || new Date().toDateString(),
        scope: 'all',
        per_page: perPage.toString(),
        page: page.toString()
    });
    
    const fetchUrl = `${GITLAB_API_URL}/projects/${projectId}/repository/commits?${params}`;
    const response = await fetch(fetchUrl, {
        headers: {
            'Authorization': `Bearer ${process.env.GITLAB_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch commits for project ${projectId}: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
}

// Get ALL commits for a user since a specific date across all their projects
async function getUserCommitsSince(
    user: GitlabUser, 
    sinceDate: string,
    toDate?: string,
): Promise<{ project: GitlabProject; commits: GitlabCommit[] }[]> {
    try {
        // Get all projects for the user
        const projects = await getGitlabUserProjects(user.id);
        
        // Get commits for each project
        const projectCommitPromises = projects.map(async (project) => {
            try {
                const allCommits: GitlabCommit[] = [];
                let page = 1;
                let hasMoreCommits = true;
                
                // Handle pagination to get ALL commits
                while (hasMoreCommits) {
                    const commits = await getProjectCommitsSince(
                        project.id, 
                        user.name, 
                        sinceDate, 
                        toDate,
                        page, 
                        100
                    );
                    
                    if (commits.length === 0) {
                        hasMoreCommits = false;
                    } else {
                        allCommits.push(...commits);
                        page++;
                        
                        // If we got less than 100 commits, we've reached the end
                        if (commits.length < 100) {
                            hasMoreCommits = false;
                        }
                    }
                }
                
                return {
                    project: project,
                    commits: allCommits
                };
            } catch (error) {
                console.error(`Failed to fetch commits for project ${project.name}:`, error);
                return {
                    project: project,
                    commits: []
                };
            }
        });
        
        const results = await Promise.all(projectCommitPromises);
        return results;
    } catch (error) {
        console.error(`Failed to fetch projects for user ${user.username}:`, error);
        return [];
    }
}

async function getUserMergeRequestsSince(
    user: GitlabUser,
    type: 'author' | 'approver' = 'author',
    sinceDate: string,
    toDate?: string,
): Promise<GitlabMergeRequest[]> {
    const allMergeRequests: GitlabMergeRequest[] = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
        const param_obj: any = {
            state: 'all',
            scope: 'all',
            per_page: '100',
            page: page.toString(),
            order_by: 'created_at',
            sort: 'desc',
            created_after: sinceDate,
            created_before: toDate || new Date().toDateString(),
        }

        if(type === 'author') param_obj.author_username = user.username;
        else param_obj['approved_by_ids[]'] = user.id;

        const params = new URLSearchParams(param_obj);

        const fetchUrl = `${GITLAB_API_URL}/merge_requests?${params}`;
        
        try {
            const response = await fetch(fetchUrl, {
                headers: {
                    'Authorization': `Bearer ${process.env.GITLAB_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch merge requests: ${response.status} ${response.statusText}`);
            }

            const mergeRequests: GitlabMergeRequest[] = await response.json();
            
            if (mergeRequests.length === 0) {
                hasMorePages = false;
            } else {
                allMergeRequests.push(...mergeRequests);
                page++;
                
                // If we got less than 100 merge requests, we've reached the end
                if (mergeRequests.length < 100) {
                    hasMorePages = false;
                }
            }
        } catch (error) {
            console.error(`Failed to fetch merge requests for user ${user.username} (page ${page}):`, error);
            hasMorePages = false;
        }
    }

    return allMergeRequests;
}


async function getUserSummary(
    user: GitlabUser,
    sinceDate: string,
    toDate?: string,
): Promise<GitlabUserSummary> {
    const mergeRequests = await getUserMergeRequestsSince(user, 'author', sinceDate);
    const reviewerMergeRequests = await getUserMergeRequestsSince(user, 'approver', sinceDate);
    const commits = await getUserCommitsSince(user, sinceDate);
    return {
        user,
        commits,
        mergeRequests: {
            author: mergeRequests,
            reviewer: reviewerMergeRequests
        }
    }
}

export async function getUsersSummary(
    users: GitlabUser[],
    sinceDate: string,
    toDate?: string,
): Promise<GitlabUserSummary[]> {
    const userSummaryPromises = users.map(async (user) => {
        return await getUserSummary(user, sinceDate, toDate)
    });

    const results = await Promise.all(userSummaryPromises);
    return results;
}