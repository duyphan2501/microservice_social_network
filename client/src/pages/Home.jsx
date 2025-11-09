import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ThreadPost from "../Components/ThreadPost";
import NewThreadModal from "../Components/NewThreadModal";

// Main Component
const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([
    {
      id: 1,
      username: "hoangsonaty",
      time: "1h",
      content: `Không phải ai mạnh mẽ cũng cứu được người khác chỉ người đủ bình tĩnh mới làm được điều đó."

Trần nhà đổ sập, trong tích tắc, người anh trong clip không mất bình tĩnh. Anh kiểm tra em đầu tiên, cầm theo điện thoại để sẵn liên lạc, công em ra khỏi khu vực nguy hiểm, thậm chí còn rút phích điện từng bước đều tĩnh táo, bản lĩnh.`,
      clip: true,
      image:
        "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80",
      likes: 450,
      comments: 4,
      reposts: 2,
      shares: 2,
      hasThread: false,
    },
    {
      id: 2,
      username: "duy",
      time: "10h",
      content: `Mấy con gà biết gì`,
      clip: false,
      image:
        "https://scontent-hkg4-1.xx.fbcdn.net/v/t39.30808-6/578269758_846776851626407_3728077980494014080_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=aa7b47&_nc_eui2=AeFEvuEtZHjW1x5r_EteGtkuHV-PI6TnlbgdX48jpOeVuBQRR-1vjqoGKlkUWa3etKZMndQ3UPyROA09y-BD1Qep&_nc_ohc=UjolMurNCVkQ7kNvwGzqspn&_nc_oc=AdlH2CNVxt3Z1TW7gyPRZ7h-LtUbW6AXz45ElUBVwJtiYYnvnpqr_wm6qauzZFC8AVOuhVQPX9pj2TIoyhD8W9m0&_nc_zt=23&_nc_ht=scontent-hkg4-1.xx&_nc_gid=lukB1H51RfZbjTidHJ4WDQ&oh=00_AfgTBtff5xO37vUBZwxX9mGzN62cV64a7zNdKv7vbBwgvw&oe=691653F3",
      likes: 450,
      comments: 4,
      reposts: 2,
      shares: 2,
      hasThread: false,
    },
  ]);

  const handleNewPost = (newPost) => {
    const post = {
      id: posts.length + 1,
      username: "ducx3452025",
      time: "Just now",
      content: newPost.content,
      likes: 0,
      comments: 0,
      reposts: 0,
      shares: 0,
      hasThread: false,
    };
    setPosts([post, ...posts]);
  };

  return (
    <div className="min-h-screen bg-white flex items-start justify-center pt-4 ">
      <div className="w-full max-w-2xl">
        {/* New Post Section */}
        <div className="border-b border-gray-200 px-4 py-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-grow text-left text-gray-400 text-[15px] py-2"
            >
              What's new?
            </button>
            <button className="px-6 py-2 text-gray-400 font-semibold text-sm">
              Post
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div>
          {posts.map((post) => (
            <ThreadPost key={post.id} post={post} />
          ))}
        </div>
      </div>

      {/* New Thread Modal */}
      <NewThreadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPost={handleNewPost}
      />
    </div>
  );
};

export default Home;
