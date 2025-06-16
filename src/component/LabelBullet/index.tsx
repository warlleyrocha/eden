type LabelBulletProps = {
  title?: string;
  type?: 'money' | 'debit' | 'credit' | 'pix';
  className?: string;
  value?: number | string;
  total?: string;
  valueTotal?: string;
};

export default function LabelBullet({
  title,
  type,
  className,
  value,
  total,
  valueTotal,
}: LabelBulletProps) {
  const getBulletColor = () => {
    switch (type) {
    case 'money':
      return 'bg-green-500';
    case 'debit':
      return 'bg-blue-500';
    case 'credit':
      return 'bg-red-500';
    case 'pix':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`flex flex-col gap-2 p-4 bg-white rounded-lg shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${getBulletColor()}`} />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">{title}</h1>
          {value && <p className="text-sm text-gray-600">{value}</p>}
        </div>
      </div>
      {total && valueTotal && (
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm font-medium">{}</span>
          <span className="text-sm">{valueTotal}</span>
        </div>
      )}
    </div>
  );
}
