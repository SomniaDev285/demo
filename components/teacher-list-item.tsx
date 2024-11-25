import Image from "next/image";
import ImagePerson1 from "@/app/images/person2.png";

export interface TeacherListItemProps {
  name?: string;
  description?: string;
  address?: string;
}

export const TeacherListItem: React.FC<TeacherListItemProps> = ({ name, description, address }) => {
  return (
    <div className="bg-white shadow-sm border rounded-md">
      <div className="flex justify-between items-center p-4 border-b-[1px]">
        <div className="flex items-center gap-1">
          <Image src={ImagePerson1} width={42} height={42} className="rounded-md" alt="" />
          {name}
        </div>
        <div className="flex gap-2">
          <button className="flex items-center px-2 py-1 border rounded-sm text-sm">Phone</button>
          <button className="flex items-center px-2 py-1 border rounded-sm text-sm">Email</button>
        </div>
      </div>
      <div className="p-4">
        <p className="mb-6">{description}</p>
        <p>Address: {address}</p>
      </div>
    </div>
  );
};
