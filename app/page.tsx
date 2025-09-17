import GitlabUserSnapshotCard from "@/components/GitlabUserSnapshotCard";
import { getUsersSummary, users } from "@/util/gitlab";

export default async function Home() {
  const currentDate = new Date();
  const oneMonthAgo = new Date(currentDate);
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  const gitlabSummary = await getUsersSummary(users, oneMonthAgo.toDateString());
  
  return (
    <div>
      <main className="flex wrap">
        {
          gitlabSummary.map((userSummary) =>  <GitlabUserSnapshotCard key={userSummary.user.id} userSummary={userSummary}/> )
        }
      </main>
    </div>
  );
}
