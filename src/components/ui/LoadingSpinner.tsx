export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeMap[size]} rounded-full border-4 border-[#FFD4B8] border-t-[#FFB38A] animate-spin`}
      />
    </div>
  );
}
