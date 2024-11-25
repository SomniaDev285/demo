import Image from "next/image";
import Link from "next/link";
import logoImg from "../images/logo.png";
import { ReadonlyURLSearchParams, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface RegisterProps {
  searchParams: ReadonlyURLSearchParams;
}

const SignUp = ({ searchParams }: RegisterProps) => {
  const { email, password, error }: any = searchParams;

  const onRegister = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      return redirect(
        `/signup?email=${email}&password=${password}&error=${error.message}`
      );
    } else {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) {
      } else {
        const user = session.user;

        const { data : userData, error : userError } = await supabase.from("user").insert({
          name: name,
          auth_id: user.id,
        });

        if (userError) {
          console.error(userError);
        } else {
          return redirect(`/sigin_host`);
        }
      }
    }
  };

  return (
    <div className="h-screen flex">
      <div className="flex-auto sm:px-12 sm:basis-[480px] sm:grow-0 sm:shrink-0 px-6 flex flex-col justify-center mx-auto">
        <div className="mx-auto mb-12">
          <Image src={logoImg} alt="" width={300} />
        </div>

        <p className="mb-6 text-2xl text-center">Create new host account</p>
        <form action={onRegister}>
          {error && (
            <div className="bg-red-200 mb-4 px-4 py-2 border border-red-300 rounded-md text-gray-700 text-sm leading-tight">
              {error}
            </div>
          )}
          <p className="mb-3">Name</p>
          <input
            name="name"
            className="mb-4 px-3 py-1.5 border rounded-sm w-full"
            placeholder="Your Name"
          />
          <p className="mb-3">Email Address</p>
          <input
            name="email"
            className="mb-4 px-3 py-1.5 border rounded-sm w-full"
            defaultValue={email}
            placeholder="Your Email"
          />
          <p className="mb-3">Password</p>
          <input
            name="password"
            type="password"
            className="mb-4 px-3 py-1.5 border rounded-sm w-full"
            defaultValue={password}
            placeholder="Your Password"
          />
          <p className="mb-3">Confirm Password</p>
          <input
            type="password"
            className="mb-4 px-3 py-1.5 border rounded-sm w-full"
            placeholder="Confirm Password"
          />
          <p className="mb-4">
            <Link href="/auth/forgot" className="text-blue-400 text-sm">
              Forgot Password?
            </Link>
          </p>
          <button className="block bg-[#388CDA] py-2 rounded-sm w-full text-white">
            SignUp
          </button>
        </form>
        <p className="text-gray-500 mt-4 text-center">
          Already have account?{" "}
          <Link href="/signin_host" className="text-[#388CDA]">
            Sign In
          </Link>
        </p>
      </div>

      <div className="flex-auto relative sm:block hidden">
        <div className="bg-[url('./images/voting_back.jpg')] bg-cover bg-no-repeat bg-center w-full h-full"></div>
        <div
          className="w-full h-full absolute inset-0 z-10"
          style={{ backdropFilter: "blur(5px)" }}
        ></div>
      </div>
    </div>
  );
};

export default SignUp;
