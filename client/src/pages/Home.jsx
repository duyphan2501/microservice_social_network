import { useCallback, useEffect, useRef, useContext } from "react";
import ThreadPost from "../components/ThreadPost";
import usePostStore from "../stores/usePostStore";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useUserStore from "../stores/useUserStore";
import { MyContext } from "../Context/MyContext";

const Home = () => {
  const fetchPosts = usePostStore((state) => state.fetchPosts);
  const resetPosts = usePostStore((state) => state.resetPosts);
  const posts = usePostStore((state) => state.posts);
  const isLoading = usePostStore((state) => state.isLoading);
  const hasMore = usePostStore((state) => state.hasMore);
  const observerElem = useRef(null);
  const user = useUserStore((state) => state.user);
  const { setIsShowLoginNavigator, setIsOpenNewPostModal } =
    useContext(MyContext);

  const axiosPrivate = useAxiosPrivate();

  const handleClickNewPost = () => {
    if (!user) setIsShowLoginNavigator(true);
    else setIsOpenNewPostModal(true);
  };

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];

      if (target.isIntersecting && hasMore && !isLoading) {
        fetchPosts(axiosPrivate);
      }
    },
    [hasMore, isLoading, fetchPosts, axiosPrivate]
  );

  // IntersectionObserver để load thêm
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

  // Gọi fetch lần đầu
  useEffect(() => {
    if (posts.length === 0) {
      fetchPosts(axiosPrivate);
    }
  }, [posts.length, axiosPrivate, fetchPosts]);

  // reset posts khi rời trang
  useEffect(() => {
    return () => {
      resetPosts();
    };
  }, [resetPosts]);

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
          {posts.length > 0
            ? posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white border rounded-2xl border-gray-200 overflow-hidden"
                >
                  <ThreadPost post={post} />
                </div>
              ))
            : !isLoading && (
                <div className="p-8 text-center text-gray-500">
                  <p>No posts yet</p>
                </div>
              )}
        </div>
      </div>

      <div ref={observerElem} style={{ padding: "20px", textAlign: "center" }}>
        {isLoading && <h4>Loading for more posts...</h4>}
        {!hasMore && !isLoading && posts.length > 0 && <h4>No more posts.</h4>}
      </div>
    </div>
  );
};

export default Home;
