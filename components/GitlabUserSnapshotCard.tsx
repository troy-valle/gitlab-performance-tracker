/* eslint-disable @next/next/no-img-element */
import { GitlabUserSummary } from "@/util/gitlab";
import Link from "next/link";

interface GitlabUserSummaryCardProps {
    userSummary: GitlabUserSummary
}

export default function GitlabUserSnapshotCard({
    userSummary
}: GitlabUserSummaryCardProps) {
    let totalComits = 0;
    
    for(const i of userSummary.commits) totalComits += i.commits.length;

    return (
        <Link className="p-2 m-2 rounded-lg border" href={`/user/${userSummary.user.username}`}>
            <img className="rounded-[30px] mx-auto" width={60} height={60} src={userSummary.user.avatar_url} alt="Profile Pic" />
            <div className="text-center pt-2 text-lg font-medium">{userSummary.user.name}</div>
            <div>Merge Request Count: {userSummary.mergeRequests.length}</div>
            <div>Commit Count: {totalComits}</div>
            <div>Avg Commits per MR: {(totalComits / userSummary.mergeRequests.length).toFixed(2)}</div>
        </Link>
    )
}