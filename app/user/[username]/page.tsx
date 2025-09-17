
type UserProps = {
   params: {
      username: string;
   }
}

export default async function User({params}: UserProps) {
  const {username} = await params;
  
  return (
    <div>
      <main className="flex wrap">
        {username}
      </main>
    </div>
  );
}
