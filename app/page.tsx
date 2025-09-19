/* @next-codemod-ignore */
import DateRangePicker from "@/components/DateRangePicker";
import GitlabUserSnapshotCard from "@/components/GitlabUserSnapshotCard";
import { getUsersSummary, users } from "@/util/gitlab";

type Props = {
  searchParams?: { 
    startDate?: string; 
    endDate?: string; 
   };
};

export default async function Home({searchParams}: Props) {
  const { startDate, endDate } = await searchParams ?? {};

  let start: Date;
  let end = new Date(endDate || new Date().toDateString());

  if (startDate) {
    start = new Date(startDate);
  }
  else {
    start = new Date();
    start.setMonth(start.getMonth() - 1);
  }

  const gitlabSummary = await getUsersSummary(users, start.toDateString(), end.toDateString());
  
  return (
    <div>
      <main>
        <DateRangePicker />
        <div className="flex wrap">
          {
            gitlabSummary.map((userSummary) =>  <GitlabUserSnapshotCard key={userSummary.user.id} userSummary={userSummary}/> )
          }
        </div>
      </main>
    </div>
  );
}
