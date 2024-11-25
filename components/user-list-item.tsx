import { getAbbreviation } from "@/lib/functions";
import { IconMessage } from "@tabler/icons-react";

export interface UserListItemProps {
  data?: any;
  isOnline?: boolean;
  type?: number;
  host?:boolean;
  onMessage?: () => void;
}

export const UserListItem: React.FC<UserListItemProps> = ({
  data = {status: 0, name: "AD", group_id: 0},
  isOnline = true,
  type = 0,
  host = false,
  onMessage = () => {},
}) => {
  return (
    <div className={`flex items-center mb-4 justify-between ${data.status == 1 && host == true ? 'bg-blue-200' : data.status == 2 && host == true? 'bg-yellow-200' :'bg-white'} rounded-md`}>
      <div className="flex items-center gap-2 py-2 px-2">
        <div className="w-12 h-12 rounded-full bg-gray-500 grid place-items-center text-white relative">
          {getAbbreviation(data.name)}
          {/* <div className="absolute bottom-0 right-0">
            <div className="w-3 h-3 rounded-full bg-gray-500 border-2 border-white"></div>
          </div> */}
          {isOnline ? (
            <div className="absolute bottom-0 right-0">
              <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
            </div>
          ) : (
            <div className="absolute bottom-0 right-0">
              <div className="w-3 h-3 rounded-full bg-gray-500 border-2 border-white"></div>
            </div>
          )}
        </div>
        <div>{data.name}({data.group_id})</div>
      </div>
      {type === 0 && data.status ==1 && <div className="text-2xl pr-2">✋</div>}
      {type === 0 && data.status == 2 && <div className="text-2xl pr-2">✌</div>}
      {type == 1 ? (
        <div className="flex items-center gap-2 cursor-pointer text-gray-500">
          <IconMessage onClick={onMessage
           } />
        </div>
      ) : (
        <> </>
      )}
    </div>
  );
};
