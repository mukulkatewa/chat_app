import React, { useContext, useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';

const Sidebar = () => {

  const { getUsers, users, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages } = useContext(ChatContext)
  const { logout, onlineUsers } = useContext(AuthContext)

  const [input, setInput] = useState("") // Changed from false to ""
  const [showDropdown, setShowDropdown] = useState(false)

  const navigate = useNavigate();
  const dropdownRef = useRef();

  // Memoize filtered users for better performance
  const filteredUsers = useMemo(() => {
    return input
      ? users.filter((user) =>
          user.fullName.toLowerCase().includes(input.toLowerCase()))
      : users;
  }, [input, users]);

  // Debounced search input handler
  const handleSearchChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  useEffect(() => {
    getUsers();
  }, [onlineUsers, getUsers]); // Added getUsers to dependencies

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    // Handle escape key
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  // Handle dropdown navigation with keyboard
  const handleMenuKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setShowDropdown(prev => !prev);
    }
  };

  const handleDropdownItemKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <div className={`bg-[#818582]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? "max-md:hidden" : ''}`}>
      <div className='pb-5'>
        <div className='flex justify-between items-center'>
          <img src={assets.logo} alt="logo" className='max-w-40' />
          
          <div className="relative py-2" ref={dropdownRef}>
            <img
              src={assets.menu_icon}
              alt="Menu"
              className='max-h-5 cursor-pointer'
              onClick={() => setShowDropdown(prev => !prev)}
              onKeyDown={handleMenuKeyDown}
              tabIndex={0}
              role="button"
              aria-label="Open menu"
              aria-expanded={showDropdown}
              aria-haspopup="true"
            />
            {showDropdown && (
              <div className='absolute top-full right-0 z-50 w-32 p-3 rounded-md bg-[#282142] border border-gray-600 text-gray-100 shadow-lg min-w-max
                            max-md:right-0 max-md:top-full 
                            max-sm:fixed max-sm:top-16 max-sm:right-4 max-sm:z-[100]'>
                <div
                  onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                  onKeyDown={(e) => handleDropdownItemKeyDown(e, () => { setShowDropdown(false); navigate('/profile'); })}
                  className='cursor-pointer text-sm p-2 rounded hover:bg-gray-700 transition-colors'
                  tabIndex={0}
                  role="menuitem"
                >
                  Edit Profile
                </div>
                <hr className="my-2 border-gray-500" />
                <div
                  onClick={() => { setShowDropdown(false); logout(); }}
                  onKeyDown={(e) => handleDropdownItemKeyDown(e, () => { setShowDropdown(false); logout(); })}
                  className='cursor-pointer text-sm p-2 rounded hover:bg-gray-700 transition-colors'
                  tabIndex={0}
                  role="menuitem"
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
          <img src={assets.search_icon} alt="Search" className='w-3' />
          <input
            onChange={handleSearchChange}
            value={input}
            type="text"
            className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1'
            placeholder='Search User...'
            aria-label="Search users"
          />
        </div>
      </div>

      <div className='flex flex-col' role="list">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <div
              onClick={() => {
                setSelectedUser(user);
                setUnseenMessages(prev => ({ ...prev, [user._id]: 0 }));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedUser(user);
                  setUnseenMessages(prev => ({ ...prev, [user._id]: 0 }));
                }
              }}
              key={user._id || index} // Use user._id as key for better React performance
              className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm transition-colors hover:bg-[#282142]/30 focus:bg-[#282142]/30 focus:outline-none ${selectedUser?._id === user._id && 'bg-[#282142]/50'}`}
              tabIndex={0}
              role="listitem"
              aria-label={`Chat with ${user.fullName} - ${onlineUsers.includes(user._id) ? 'Online' : 'Offline'}${unseenMessages[user._id] > 0 ? ` - ${unseenMessages[user._id]} unread messages` : ''}`}
            >
              <div className="relative">
                <img 
                  src={user?.profilePic || assets.avatar_icon} 
                  alt={`${user.fullName}'s profile`} 
                  className='w-[35px] aspect-[1/1] rounded-full' 
                />
                {onlineUsers.includes(user._id) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#818582]/10"></div>
                )}
              </div>
              
              <div className='flex flex-col leading-5 flex-1'>
                <p className="truncate">{user.fullName}</p>
                {onlineUsers.includes(user._id)
                  ? <span className='text-green-400 text-xs'>Online</span>
                  : <span className='text-neutral-400 text-xs'>Offline</span>}
              </div>
              
              {unseenMessages[user._id] > 0 && (
                <div className='flex items-center justify-center min-w-[20px] h-5 px-1 text-xs rounded-full bg-violet-500 text-white font-medium'>
                  {unseenMessages[user._id] > 99 ? '99+' : unseenMessages[user._id]}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-4">
            {input ? 'No users found' : 'No users available'}
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar;