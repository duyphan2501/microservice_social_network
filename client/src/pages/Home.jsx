import { useCallback, useEffect, useRef, useState } from "react";
import ThreadPost from "../components/ThreadPost";
import NewThreadModal from "../components/NewThreadModal";
import usePostStore from "../stores/usePostStore";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useUserStore from "../stores/useUserStore";
import { MyContext } from "../Context/MyContext";
import { useContext } from "react";

// Main Component
const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { posts, isLoading, hasMore, fetchPosts } = usePostStore();
  const observerElem = useRef(null);
  const user = useUserStore((state) => state.user);
  const { setIsShowLoginNavigator, isShowLoginNavigator } =
    useContext(MyContext);

  const handleClickNewPost = () => {
    if (!user) setIsShowLoginNavigator(true);
    else setIsModalOpen(true);
  };

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        fetchPosts(); // Gọi hàm fetch từ store
      }
    },
    [isLoading, hasMore, fetchPosts]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "0px",
      threshold: 0.9,
    };

    const observer = new IntersectionObserver(handleObserver, option);
    const target = observerElem.current;

    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [handleObserver]);

  useEffect(() => {
    if (posts.length === 0) {
      fetchPosts();
    }
  }, [fetchPosts, posts.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto pt-4">
        {/* New Post Button */}
        <div className="bg-white rounded-2xl border border-gray-200 px-4 py-4 mb-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
              <img src={user?.avatar_url} alt="" />
            </div>
            <button
              onClick={handleClickNewPost}
              className="flex-grow text-left text-gray-400 text-[15px] py-2"
            >
              What's new?
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts &&
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                <ThreadPost post={post} />
              </div>
            ))}
        </div>
      </div>
      <div ref={observerElem} style={{ padding: "20px", textAlign: "center" }}>
        {isLoading && <h4>Đang tải thêm bài viết...</h4>}
        {!hasMore && !isLoading && <h4>Đã tải hết tất cả bài viết.</h4>}
      </div>

      <NewThreadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Home;
