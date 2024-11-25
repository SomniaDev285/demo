import { getAbbreviation } from "@/lib/functions";

export interface ChatProps {
    user: any
}

export const Chat: React.FC<ChatProps> = ({ user }) => {
  return (
    <div className="relative top-0 flex flex-col right-0 bottom-0 rounded-md shadow-md border py-6 bg-white w-[360px]">
      <div className="flex items-center gap-2 border-b pb-4 px-6 grow-0 shrink-0">
        <div className="w-12 h-12 rounded-full bg-gray-500 grid place-items-center text-white relative">
          {getAbbreviation(user['name'])}
          <div className="absolute bottom-0 right-0">
            <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
          </div>
          <div className="absolute bottom-0 right-0">
            <div className="w-3 h-3 rounded-full bg-gray-500 border-2 border-white"></div>
          </div>
        </div>
        {user.name}({user.group_id})
      </div>

      <div className="flex-auto p-4 overflow-auto">
        <div className="px-4 py-2 text-wrap break-words mb-4 max-w-[80%] bg-gray-400 rounded-2xl  ">
          <p className="text-white text-sm">
            Lorem ipsum dolar sit amet Lorem ipsum dolar sit amet Lorem ipsum
            dolar sit amet Lorem ipsum dolar sit amet
          </p>
          <p className="text-right text-gray-200 text-xs">10:21 11/24</p>
        </div>
        <div className="px-4 py-2 text-wrap mb-4 ml-auto break-words max-w-[80%] bg-blue-400 rounded-2xl">
          <p className="text-white text-sm">
            Lorem ipsum dolar sit amet Lorem ipsum dolar sit amet Lorem ipsum
            dolar sit amet Lorem ipsum dolar sit amet
          </p>
          <p className="text-right text-gray-200 text-xs">10:21 11/24</p>
        </div>
      </div>

      <div className="flex gap-2 px-4 pt-4 border-t">
        <input className="w-full px-4 py-2 border-blue-300 border rounded-md" />
        <button className="bg-blue-400 rounded-md px-3 py-1.5 text-white grow-0 shrink-0 text-sm">
          Send
        </button>
      </div>
    </div>
  );
};
