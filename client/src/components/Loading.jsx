
const Loading = () => {
  return (
    <>
      <div className="fixed inset-0 z-50 opacity-30"></div>
      <div className="fixed inset-0 z-60 bg-white flex items-center justify-center">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="size-20 border-6 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;
