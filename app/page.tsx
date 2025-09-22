/* @next-codemod-ignore */
import DateRangePicker from "@/components/DateRangePicker";
import GitlabUserSnapshotCard from "@/components/GitlabUserSnapshotCard";
import { users } from "@/util/gitlab";

type Props = {
  searchParams?: { 
    startDate?: string; 
    endDate?: string; 
   };
};

export default async function Home({searchParams}: Props) {
  const { startDate, endDate } = await searchParams ?? {};

  let start: Date;
  let end = new Date(endDate || new Date().toISOString());

  if (startDate) {
    start = new Date(startDate);
  }
  else {
    start = new Date();
    start.setMonth(start.getMonth() - 1);
  }
  
  return (
    <div>
      <main>
        <DateRangePicker initStartDate={start.toISOString()} initEndDate={end.toISOString()}/>
        <div className="flex wrap">
          {
            users.map((user) =>  <GitlabUserSnapshotCard key={user.id} user={user} startDate={start.toISOString()} endDate={end.toISOString()}/> )
          }
        </div>
      </main>
    </div>
  );
}
