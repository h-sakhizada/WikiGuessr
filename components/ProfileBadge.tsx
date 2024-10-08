type ProfileBadgeProps = {
  icon: string;
  title?: string;
  description?: string;
};
export default function ProfileBadge(props: ProfileBadgeProps) {
  return (
    <div className="flex items-center space-x-2">
      <img src={props.icon} className="w-8 h-8" />
      <div>
        <h3 className="text-sm font-semibold">{props.title}</h3>
        <p className="text-xs text-gray-500">{props.description}</p>
      </div>
    </div>
  );
}
