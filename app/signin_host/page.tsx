import Image from "next/image";
import Link from "next/link";
import logoImg from '../images/logo.png'
import { ReadonlyURLSearchParams, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { randomInt, setEngine } from "crypto";

export interface RegisterProps {
  params: ReadonlyURLSearchParams;
}

const SignIn = ({ params }: RegisterProps) => {

  const { email, password, error }: any = params;

  const onLogin = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    const session = (await supabase.auth.getSession()).data.session;
    if(!session){
      redirect('/sigin_host')
    }else{
      const user = session.user;
      if (error) {
        return redirect(`/auth/login?email=${email}&password=${password}&error=${error.message}`);
      } else {
        const code = randomInt(100000, 999999);
        const {data, error} = await supabase.from('rooms').insert({
          code: code
        });
        if(error){
          console.log(">>>>>>>>>>>>>>> Error")
          console.log(error.message)
        } else {
          const {data, error} = await supabase.from('user').update({
            room_num: code
          }).eq("auth_id" , user.id).select();
          if(!error){
            return redirect(`/host_dash?user_id=${data[0].id}`);
          }else{
            console.error(error);
          }
        }
      }
    }
  };

  return (
    <div className="h-screen flex">
      <div className="flex-auto relative sm:block hidden" >
        <div className="bg-[url('./images/voting_back.jpg')] bg-cover bg-no-repeat bg-center w-full h-full" ></div>
        <div className="w-full h-full absolute inset-0 z-10" style={{ backdropFilter: "blur(5px)" }}></div>
      </div>
      <div className="flex-auto sm:px-12 sm:basis-[480px] sm:grow-0 sm:shrink-0 px-6 flex flex-col justify-center mx-auto">
        <div className="mx-auto mb-12">
          <Image src={logoImg} alt="" width={300} />
        </div>

        <p className="mb-6 text-2xl text-center">Login to your host account</p>
        <form action={onLogin}>
        {error && (
          <div className="bg-red-200 mb-4 px-4 py-2 border border-red-300 rounded-md text-gray-700 text-sm leading-tight">
            {error}
          </div>
        )}
          <p className="mb-3">Email Address</p>
          <input name="email" className="mb-4 px-3 py-1.5 border rounded-sm w-full"  defaultValue={email} placeholder="Your Email" />
          <p className="mb-3">Password</p>
          <input name="password" type="password" className="mb-4 px-3 py-1.5 border rounded-sm w-full" defaultValue={password} placeholder="Your Password" />
          <label className="block mb-4">
            <input type="checkbox" name="remember" /> Remember me
          </label>
          <button className="block bg-[#388CDA] py-2 rounded-sm w-full text-white">SignIn</button>
        </form>
        <p className="text-gray-500 mt-4 text-center">To <Link href="/signin_guest" className="text-[#388CDA]">Sign In</Link> as a Guest </p>
        <p className="text-gray-500 mt-4 text-center">Don't have account? <Link href="/signup" className="text-[#388CDA]">Sign Up</Link></p>
      </div>
    </div>
  );
};

export default SignIn;
