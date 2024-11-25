"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import logoImg from "../images/logo.png";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const SignInGuest: React.FC = () => {
  const data = useSearchParams();
  const error = data.get("error");
  const [inputRoomNum, setInputRoomNum] = useState<string>("");
  const [groups, setGroups] = useState<string[]>([]);

  // async () => {
  //   const supabase = createClient();

  //   supabase
  //     .channel("groups")
  //     .on(
  //       "postgres_changes",
  //       { event: "INSERT", schema: "public", table: "groups" },
  //       handleInserts
  //     )
  //     .subscribe();

  //   supabase
  //     .channel("groups1")
  //     .on(
  //       "postgres_changes",
  //       { event: "DELETE", schema: "public", table: "groups" },
  //       handleDelete
  //     )
  //     .subscribe();
  // };

  const onChagneRommNum = async (event: any) => {
    const supabase = createClient();
    setInputRoomNum(event.target.value);

    const { data: groupData, error: groupError } = await supabase
      .from("groups")
      .select()
      .eq("room_num", event.target.value);
    if (groupError) {
      console.log(groupError);
    } else {
      // console.log(groupData)
      setGroups(groupData);
    }
  };

  useEffect(() => {
    async () => {
      const supabase = createClient();

      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select()
        .eq("room_num", inputRoomNum);
      if (groupError) {
        console.log(groupError);
      } else {
        setGroups(groupData);
      }
    };
  }, []);

  const onLogin = async (formData: FormData) => {
    const room_num = formData.get("room_num") as string;
    const name = formData.get("name") as string;
    const group = formData.get("group") as string;
    // console.log(group)

    const supabase = createClient();

    const { error: userError, data: userData } = await supabase
      .from("user")
      .select()
      .eq("room_num", room_num);
    const { error: roomError, data: roomData } = await supabase
      .from("rooms")
      .select("members")
      .eq("code", room_num);

    if (roomError) {
      alert(roomError.message);
    }

    if (roomData && roomData.length > 0 && userData) {
      if (roomData[0].members >= userData.length) {
        const { error: groupError, data: groupData } = await supabase
          .from("groups")
          .select()
          .match({ room_num: room_num, name: group });
        if (groupError) {
          window.alert(groupError.message);
        } else {
          const { data: newUserData, error: newUserError } = await supabase
            .from("user")
            .insert({
              name: name,
              room_num: room_num,
              group_id: groupData[0].name,
            })
            .select()
            .single();
          // console.log(newUserData.id)
          return redirect(`/guest_dash?user_id=${newUserData.id}`);
        }
      } else {
        return redirect(`/signin_guest?error=Exceeds the limit of members`);
      }
    }
  };

  // const handleInserts = async (payload: any) => {
  //   const { errors, new: data } = payload;

  //   if (errors) {
  //     console.log(errors);
  //   } else {
  //     console.log("insert");
  //     // setGroupData((prev) => [...prev, data]);
  //   }
  // };

  // const handleDelete = async (payload: any) => {
  //   const { errors, old: data } = payload;

  //   if (errors) {
  //     console.log(errors);
  //   } else {
  //     console.log("delete");
  //     // setGroupData((prev) => prev.filter((r) => r.id !== data.id));
  //   }
  // };

  return (
    <div className="h-screen flex">
      <div className="flex-auto relative sm:block hidden">
        <div className="bg-[url('./images/voting_back.jpg')] bg-cover bg-no-repeat bg-center w-full h-full"></div>
        <div
          className="w-full h-full absolute inset-0 z-10"
          style={{ backdropFilter: "blur(5px)" }}
        ></div>
      </div>
      <div className="flex-auto sm:px-12 sm:basis-[480px] sm:grow-0 sm:shrink-0 px-6 flex flex-col justify-center mx-auto">
        <div className="mx-auto mb-12">
          <Image src={logoImg} alt="" width={300} />
        </div>
        <form action={onLogin}>
          <p className="mb-6 text-2xl text-center">
            Login to your Guest account
          </p>
          {error && (
            <div className="bg-red-200 mb-4 px-4 py-3 border border-red-300 rounded-sm text-gray-600 text-sm leading-tight">
              {error}
            </div>
          )}
          <p className="mb-3">Room Number</p>
          <input
            name="room_num"
            className="mb-4 px-3 h-9 border rounded-sm w-full"
            placeholder="Room Number"
            value={inputRoomNum}
            onChange={(e) => onChagneRommNum(e)}
          />
          <p className="mb-3">Name</p>
          <input
            name="name"
            className="mb-4 px-3 h-9 border rounded-sm w-full"
            placeholder="Your Name"
          />
          <p className="mb-3">Group</p>
          <select
            name="group"
            className="mb-4 px-3 h-9 border rounded-sm w-full"
          >
            {groups.map((r: any) => (
              <option key={r.id}>{r.name}</option>
            ))}
          </select>
          <label className="block mb-4">
            <input type="checkbox" name="remember" /> Remember me
          </label>
          <button className="block bg-[#388CDA] py-2 rounded-sm w-full text-white">
            SignIn
          </button>
        </form>
        <p className="text-gray-500 mt-4 text-center">
          To{" "}
          <Link href="/signin_host" className="text-[#388CDA]">
            Sign In
          </Link>{" "}
          as a Host{" "}
        </p>
      </div>
    </div>
  );
};

export default SignInGuest;
