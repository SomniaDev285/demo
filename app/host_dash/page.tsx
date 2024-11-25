"use client";
import { IconSettings, IconUser, IconCancel } from "@tabler/icons-react";
import Image from "next/image";
import logoImg from "../images/logo.png";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { CountDown } from "@/components/count-down";
import { UserListItem } from "@/components/user-list-item";
import { Chat } from "@/components/chat";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import ReactApexChart from "react-apexcharts";

const HostDashborad: React.FC = () => {
  const searchParams = useSearchParams();
  const [groupInsertData, setGroupInsertData] = useState<string>("");
  const [timeInsertData, setTimeInsertData] = useState<string>("");
  const [maxInsertData, setMaxInsertData] = useState<string>("");
  const [groupData, setGroupData] = useState<any[]>([]);
  const userId = searchParams.get("user_id");
  const [users, setUsers] = useState<any[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [chatVisible, setChatVisible] = useState<boolean>(false);
  const [settingVisible, setSettingVisible] = useState<boolean>(false);
  const [result, setResult] = useState<number>(0);
  const [voteDisable, setVoteDisable] = useState<boolean>(false);
  const [resultDisable, setResultDisable] = useState<boolean>(true);
  const [voteClicked, setVoteClicked] = useState<boolean>(false);

  const [time, setTime] = useState<number>(0);

  const [isPlaying, setPlay] = useState<boolean>(false);
  const [reset, setReset] = useState<number>(0);

  const [roomNum, setRoomNum] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const [user, setUser] = useState<any>({});

  useEffect(() => {
    (async () => {
      const supabase = createClient();

      supabase
        .channel("groups")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "groups" },
          handleGroupInserts
        )
        .subscribe();

      supabase
        .channel("groups1")
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "groups" },
          handleGroupDelete
        )
        .subscribe();

      supabase
        .channel("userUpate")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "user" },
          handleUserUpdates
        )
        .subscribe();

        supabase
        .channel("userInsert")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "user" },
          handleUserUpdates
        )
        .subscribe();

      supabase
        .channel("userRooms")
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
      }

      const { data: groupData1, error: groupError } = await supabase
        .from("groups")
        .select()
        .eq("room_num", userData.room_num);
      if (groupError) {
        console.log(groupError);
      } else {
        setGroupData(groupData1);
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
        .neq("status", 0);
      if (speakersError) {
        console.log(speakersError);
      } else {
        setSpeakers(speakers);
      }

      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select()
        .match({ code: userData.room_num });
      if (roomError) {
        console.log(roomError);
      } else {
        setTime(roomData[0].time);
        setResult(roomData[0].result);
      }
    })();
  }, []);

  useEffect(() => {
    setReset(reset + 1);
    setPlay(false);
  }, [time]);

  useEffect(() => {}, [voteDisable, result]);

  const onAddGroup = async () => {
    const supabase = createClient();

    const { data: groupCheckData, error: checkError } = await supabase
      .from("groups")
      .select()
      .match({ name: groupInsertData, room_num: roomNum });

    if (checkError) {
      window.alert(checkError.message);
    } else {
      if (groupCheckData.length != 0) {
        window.alert("Same name group.");
      } else {
        const { error } = await supabase
          .from("groups")
          .insert({ name: groupInsertData, room_num: roomNum });

        if (error) {
          window.alert(error.message);
        } else {
          setGroupInsertData("");
        }
      }
    }
  };

  const onDeleteGroup = async (data: any) => {
    const supabase = createClient();

    const { error } = await supabase.from("groups").delete().eq("id", data);

    if (error) {
      window.alert(error.message);
    }
  };

  const onSave = async () => {
    const supabase = createClient();

    const { error } = await supabase
      .from("rooms")
      .update({ time: timeInsertData, members: maxInsertData })
      .eq("code", roomNum);

    if (error) {
      window.alert(error.message);
    }

    setSettingVisible(false);
  };

  const onGoVote = async () => {
    const supabase = createClient();

    setResult(1);

    const { error } = await supabase
      .from("rooms")
      .update({ result: 1 })
      .eq("code", roomNum);

    if (error) {
      window.alert(error.message);
    }
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

    if (error) {
      window.alert(error.message);
    }
  };

  const handleUserUpdates = async (payload: any) => {
    const { errors, new: data } = payload;

    if (errors) {
      console.log(errors);
    } else {
      if (data.is_voting == true) {
        setSpeakers((prev) => [...prev.filter((r) => r.id !== data.id), data]);
      }
    }
  };

  const handleUserInserts = async (payload: any) => {
    const { errors, new: data } = payload;

    if (errors) {
      console.log(errors);
    } else {
      if (data.is_voting == true) {
        setUsers((prev) => [...prev, data]);
      }
    }
  };
  const handleRoomsUpdates = async (payload: any) => {
    const { errors, new: data } = payload;

    if (errors) {
      console.log(errors);
    } else {
      setTime(data.time);
    }
  };

  const handleGroupInserts = async (payload: any) => {
    const { errors, new: data } = payload;

    if (errors) {
      console.log(errors);
    } else {
      setGroupData((prev) => [...prev, data]);
    }
  };

  const handleGroupDelete = async (payload: any) => {
    const { errors, old: data } = payload;

    if (errors) {
      console.log(errors);
    } else {
      setGroupData((prev) => prev.filter((r) => r.id !== data.id));
    }
  };


  const renderTime = (remainingTime: number) => {

    return (
      <div className="text-center">
        <p className="font-bold text-3xl">{remainingTime}</p>
        <p>Seconds</p>
      </div>
    );
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

  const onBack = async () => {
    const supabase = createClient();

    setResult(0);
    setVoteClicked(false);
    setResultDisable(true);
    setVoteDisable(false);
    const { error } = await supabase
      .from("rooms")
      .update({ result: 0 })
      .eq("code", roomNum);

    if (error) {
      window.alert(error.message);
    }

    const { error: roomsError } = await supabase
      .from("user")
      .update({ is_voting: false, status: 0 })
      .eq("room_num", roomNum);

    if (roomsError) {
      window.alert(roomsError.message);
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
              <div
                className="rounded-md text-white w-12 h-12 grid cursor-pointer place-items-center bg-blue-400"
                onClick={() => setSettingVisible(true)}
              >
                <IconSettings />
              </div>
              <div className="rounded-md text-white flex items-center gap-2 h-12 bg-blue-400 px-4">
                <IconUser />
                {userName}(Group)
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
              host={true}
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

          {users
            .filter((r: any) => r.id != userId)
            .map((r: any) => (
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
        <div className="flex-auto justify-center flex flex-col items-center border gap-6 rounded-md shadow-md bg-white p-6">
          {result == 0 ? (
            <>
              <CountDown time={time * 60} key={reset} isPlaying={isPlaying} />
              <div className="justify-center flex items-center gap-4">
                <button
                  className={`rounded-md text-white py-3 px-6 ${
                    isPlaying ? "bg-red-400" : "bg-blue-400"
                  }`}
                  onClick={() => setPlay((prev) => !prev)}
                >
                  {isPlaying ? "Stop Timer" : "Start Timer"}
                </button>
                <button
                  className="rounded-md bg-blue-400 text-white py-3 px-6"
                  onClick={() => {
                    setReset(reset + 1);
                    setPlay(false);
                  }}
                >
                  Reset Timer
                </button>
              </div>
              <button
                className="rounded-md bg-blue-400 text-white py-3 px-6"
                onClick={() => onGoVote()}
              >
                Go to Vote
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
                onComplete={() => {
                  // Handle completion event
                  setVoteDisable(true);
                  setResultDisable(false);
                  return {
                    shouldRepeat: false,
                    newInitialRemainingTime: 10,
                  };
                }}
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

                <button
                  className="rounded-md bg-blue-400 text-white py-3 px-6 disabled:bg-blue-200"
                  onClick={() => {
                    onResult();
                  }}
                  disabled={resultDisable}
                >
                  Go to Result
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
                <button
                  className="rounded-md bg-gray-400 text-white py-2 px-4"
                  onClick={() => onBack()}
                >
                  Back
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

      {settingVisible && (
        <div className="fixed inset-0 grid place-items-center z-40">
          <div
            className="absolute inset-0 bg-black/30 z-40"
            style={{ backdropFilter: "blur(2px)" }}
            onClick={() => setSettingVisible(false)}
          ></div>
          <div className="max-w-96 w-full bg-white rounded-lg z-50 p-6 animate-zoom">
            <p className="mb-6 text-2xl text-center">Setting</p>
            <p className="mb-3">Max Particitants</p>
            <input
              name="max_members"
              className="mb-4 px-3 h-9 border rounded-sm w-full"
              value={maxInsertData}
              onChange={(e) => setMaxInsertData(e.target.value)}
              placeholder="Max Particitants"
            />
            <p className="mb-3">Time</p>
            <input
              name="time"
              className="mb-4 px-3 h-9 border rounded-sm w-full"
              value={timeInsertData}
              onChange={(e) => setTimeInsertData(e.target.value)}
              placeholder="Time"
            />
            <p className="mb-3">Group</p>
            <input
              name="group"
              className="mb-4 px-3 h-9 border rounded-sm w-full"
              value={groupInsertData}
              onChange={(e) => setGroupInsertData(e.target.value)}
              placeholder="Group"
            />
            <div className="flex gap-2 flex-wrap mb-6">
              {groupData.map((r: any) => (
                <div
                  key={r["id"]}
                  className="px-3 py-1.5 border border-blue-400 text-blue-400 rounded-md text-sm flex gap-2 items-center"
                >
                  {r["name"]}
                  <div className="cursor-pointer">
                    <IconCancel
                      size={16}
                      onClick={() => {
                        onDeleteGroup(r.id);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              className="block bg-[#388CDA] py-2 rounded-sm w-full text-white mb-4"
              onClick={() => onAddGroup()}
            >
              ADD
            </button>
            <button
              className="block ml-auto bg-[#388CDA] py-2 rounded-sm  px-6 text-white"
              onClick={() => onSave()}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostDashborad;
