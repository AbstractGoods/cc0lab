import clsx from "clsx";

export type P9FrameProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

export function P9Frame({ children, className }: P9FrameProps) {
  return (
    <div
      className={clsx(
        "border-4 border-black p-px bg-white box-border",
        className
      )}
    >
      {children}
    </div>
  );
}
