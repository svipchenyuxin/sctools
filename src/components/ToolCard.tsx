interface ToolCardProps {
  name: string;
  description: string;
  icon?: string;
  url: string;
  category: string;
}

export default function ToolCard({ name, description, icon, url, category }: ToolCardProps) {
  return (
    <div className="card flex flex-col h-full transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center mb-3">
        {icon ? (
          <div className="w-10 h-10 mr-3 flex items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        ) : (
          <div className="w-10 h-10 mr-3 flex items-center justify-center rounded-full bg-primary/10 text-primary">
            T
          </div>
        )}
        <h3 className="text-lg font-semibold">{name}</h3>
      </div>
      <p className="text-gray-600 mb-4 flex-grow">{description}</p>
      <div className="flex justify-between items-center mt-auto">
        <span className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded-full">{category}</span>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-primary text-sm py-1 px-3"
        >
          前往使用
        </a>
      </div>
    </div>
  );
} 