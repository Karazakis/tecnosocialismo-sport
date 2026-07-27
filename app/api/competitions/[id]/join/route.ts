import { getSuiteUser } from "@/lib/auth";
import { joinCompetition } from "@/lib/store";

export async function POST(request:Request, context:{params:Promise<{id:string}>}) {
  const user=await getSuiteUser(new Headers(request.headers)); if(!user) return Response.json({error:"Accedi per iscriverti."},{status:401});
  const {id}=await context.params; const result=await joinCompetition(id,user.id);
  if("error" in result) return Response.json({error:result.error},{status:result.status});
  return Response.json(result);
}
