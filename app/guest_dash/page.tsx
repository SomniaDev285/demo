"use client";
import { IconSettings, IconUser, IconMessage } from "@tabler/icons-react";
import Image from "next/image";
import logoImg from "../images/logo.png";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { UserListItem } from "@/components/user-list-item";
import { Chat } from "@/components/chat";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import ReactApexChart from "react-apexcharts";


const GuestDashborad = () => {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<number>(0);
  const [group, setGroup] = useState<string>("");
  const [chatVisible, setChatVisible] = useState<boolean>(false);
  const [raiseClicked, setRaiseClicked] = useState<boolean>(false);
  const [replicClicked, setReplicClicked] = useState<boolean>(false);
  const userId = searchParams.get("user_id");
  const [roomNum, setRoomNum] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [user, setUser] = useState<any>({});
  const [voteClicked, setVoteClicked] = useState<boolean>(false);
  const [voteDisable, setVoteDisable] = useState<boolean>(false);

  const renderTime = (remainingTime: number) => {
    if (remainingTime === 0) {
      setVoteDisable(true);
    }

    return (
      <div className="text-center">
        <p className="font-bold text-3xl">{remainingTime}</p>
        <p>Seconds</p>
      </div>
    );
  };
  const onRaise = async () => {
    setRaiseClicked(true);
    setReplicClicked(false);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("user")
      .update({ status: 1 })
      .eq("id", userId)
      .select();
  };

  const onReplic = async () => {
    setRaiseClicked(false);
    setReplicClicked(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("user")
      .update({ status: 2 })
      .eq("id", userId)
      .select();
  };

  const onVote = async () => {
    const supabase = createClient();

    setVoteClicked((prev) => !prev);

    const { error, data } = await supabase
      .from("user")
      .update({ is_voting: !voteClicked })
      .eq("id", userId)
      .select()
      .single();

    console.log(data);
    if (error) {
      window.alert(error.message);
    }
  };

  const onResult = async () => {
    const supabase = createClient();

    setResult(2);

    const { error } = await supabase
      .from("rooms")
      .update({ result: 2 })
      .eq("code", roomNum);

    if (error) {
      window.alert(error.message);
    }
  };

  useEffect(() => {
    (async () => {
      const supabase = createClient();

      supabase
        .channel("userUpate")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "user" },
          handleUserUpdates
        )
        .subscribe();

      supabase
        .channel("roomUpate")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "rooms" },
          handleRoomsUpdates
        )
        .subscribe();

      const { data: userData, error: userError } = await supabase
        .from("user")
        .select()
        .eq("id", userId)
        .single();

      if (userError) {
        console.log(userError);
      } else {
        setRoomNum(userData.room_num);
        setUserName(userData.name);
        setRaiseClicked(userData.status == 1);
        setReplicClicked(userData.status == 2);
        setGroup(userData.group_id);
      }

      const { data: usersData, error: usersError } = await supabase
        .from("user")
        .select()
        .eq("room_num", userData.room_num);
      if (usersError) {
        console.log(usersError);
      } else {
        setUsers(usersData);
      }
      const { data: speakers, error: speakersError } = await supabase
        .from("user")
        .select()
        .match({ room_num: userData.room_num })
        .neq("status", 0)
        .order("group_id", { ascending: false });
      if (speakersError) {
        console.log(usersError);
      } else {
        setSpeakers(speakers);
      }
    })();
  }, []);

  useEffect(() => {}, [result]);

  const handleUserUpdates = async (payload: any) => {
    const { errors, new: data } = payload;

    if (errors) {
      console.log(errors);
    } else {
      if (data.is_voting == false) {
        setSpeakers((prev) => [...prev.filter((r) => r.id !== data.id), data]);
      }
      setVoteClicked(data.is_voting);
      setVoteDisable(false);
      if (data.status == 0) {
        setRaiseClicked(false);
        setReplicClicked(false);
      }
    }
  };

  const handleRoomsUpdates = async (payload: any) => {
    const { errors, new: data } = payload;

    if (errors) {
      console.log(errors);
    } else {
      setResult(data.result);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="border-b shadow-2xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between grow-0 shrink-0">
            <Image src={logoImg} alt="" width={300} />
            <div className="flex items-center gap-4">
              <p className="text-5xl text-gray-500 font-semibold">{roomNum}</p>
              <div className="rounded-md text-white w-12 h-12 grid place-items-center bg-blue-400">
                <IconSettings />
              </div>
              <div className="rounded-md text-white flex items-center gap-2 h-12 bg-blue-400 px-4">
                <IconUser />
                {userName}({group})
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-auto overflow-hidden p-6 flex gap-6 bg-gray-50 text-gray-600 relative">
        <div className="basis-[300px] border rounded-md shadow-md grow-0 shrink-0 p-6 bg-white">
          <p className="text-2xl font-semibold mb-6">
            Speakers({speakers.length})
          </p>

          {speakers.map((r: any) => (
            <UserListItem
              key={r["id"]}
              data={r}
              type={0}
              isOnline={true}
              onMessage={() => setChatVisible((prev) => !prev)}
            />
          ))}
        </div>
        <div className="basis-[300px] border rounded-md shadow-md grow-0 shrink-0 p-6 bg-white">
          <p className="text-2xl font-semibold text-gray-600 mb-6">
            All Members({users.filter((r: any) => r.id != userId).length})
          </p>

          {users.filter((r: any) => r.id != userId).map((r: any) => (
            <UserListItem
              key={r["id"]}
              data={r}
              type={1}
              isOnline={true}
              onMessage={() => {
                setChatVisible((prev) => !prev);
                setUser(r);
              }}
            />
          ))}
        </div>

        <div className="flex-auto justify-center flex flex-col items-center border gap-24 rounded-md shadow-md bg-white p-6">
          {result == 0 ? (
            <>
              <button
                className={`rounded-md  text-white py-5 px-10 text-3xl disabled:opacity-40 transition-all ${
                  raiseClicked ? "bg-red-500" : "bg-blue-500"
                }`}
                onClick={onRaise}
                disabled={raiseClicked}
              >
                Raise 🤚
              </button>
              <button
                className={`rounded-md text-white py-5 px-10 text-3xl disabled:opacity-40 transition-all ${
                  replicClicked ? "bg-red-500" : "bg-blue-500"
                }`}
                onClick={onReplic}
                disabled={replicClicked}
              >
                Replic ✌🏼
              </button>
            </>
          ) : result == 1 ? (
            <div className=" justify-center items-center flex flex-col gap-6">
              <CountdownCircleTimer
                size={160}
                strokeWidth={10}
                isPlaying={true}
                colors={["#60A5FA", "#ff0000"]}
                colorsTime={[10, 0]}
                duration={10}
              >
                {({ remainingTime }) => renderTime(remainingTime)}
              </CountdownCircleTimer>
              <div className="justify-center flex items-center gap-4">
                <button
                  className={`rounded-md text-white py-3 px-6 disabled:bg-blue-200 ${
                    voteClicked ? "bg-red-400" : " bg-blue-400"
                  }`}
                  disabled={voteDisable}
                  onClick={() => onVote()}
                >
                  Vote
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full">
            <h1 className="py-6 text-4xl text-center">Voting Result</h1>
            <div className="grid grid-cols-2 h-96 mb-8">
              <div className="max-w-96 mx-auto w-full">
                <ReactApexChart
                  series={[
                    users.filter((i) => i.is_voting == true).length,
                    users.filter((i) => i.is_voting == false).length,
                  ]}
                  type="donut"
                  height={400}
                  options={{
                    labels: ["vote", "neg vote"],
                    dataLabels: { enabled: true },
                    legend: { position: "bottom" },
                  }}
                />
              </div>
              <div className="max-w-96 mx-auto w-full">
                <p className="text-2xl">
                  Total Participants ({users.length})
                </p>
                {users.map((r: any, index: number) => (
                  <div
                    key={index}
                    className="mb-2 bg-blue-100 rounded-md px-6 py-2.5"
                  >
                    {r.name} ({r.group_id})
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-4">
              <button className="rounded-md bg-blue-400 text-white py-2 px-4">
                Save
              </button>
            </div>
          </div>
          )}
        </div>

        {chatVisible && <Chat user={user} />}
      </div>

      <div className="bg-blue-400 text-white">
        <div className="h-20 flex container mx-auto items-center justify-between">
          <div className="flex gap-4 items-center">
            <p className="font-bold text-3xl">MeetRoomify</p>
            <p>@2024 MeetRoomify</p>
          </div>
          <div className="flex items-center gap-6">
            <p>Contact US</p>
            <p>Terms</p>
            <p>Privary</p>
            <p>Support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDashborad;
