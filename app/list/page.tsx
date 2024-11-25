import { TeacherListItem } from "@/components/teacher-list-item";

const List: React.FC = () => {
  return (
    <div className="gap-2 grid grid-cols-2 lg:grid-cols-3 mx-auto px-4 py-6 container">
      {[1, 2, 3, 4, 5].map((r) => (
        <TeacherListItem key={r} name={`Title ${r}`} description={`Description ${r}`} address={`Address ${r}`} />
      ))}
    </div>
  );
};

export default List;
