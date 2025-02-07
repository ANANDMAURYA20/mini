"use client";
import React from "react";
import { useState, useEffect,useCallback} from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import library1 from "../assets/images/library1.jpg.jpg";
import library2 from "../assets/images/library2.jpg.jpg";
import library3 from "../assets/images/library3.jpg.jpg";

function MainComponent() {
  const [currentRoute, setCurrentRoute] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSignup, setShowSignup] = useState(false);

  const carouselImages = [library1, library2, library3];


  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:9000/api/books");
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowBook = async (bookId) => {
    if (!isLoggedIn || !userProfile) {
      setError("Please login to borrow books");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:9000/api/books/borrow/${userProfile.id}/${bookId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) {
        fetchBooks();
      } else {
        setError("Failed to borrow book");
      }
    } catch (err) {
      setError("Failed to borrow book");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (bookId) => {
    if (!isLoggedIn || !userProfile) {
      setError("Please login to return books");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:9000/api/books/return/${userProfile.id}/${bookId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) {
        fetchBooks();
      } else {
        setError("Failed to return book");
      }
    } catch (err) {
      setError("Failed to return book");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("http://localhost:9000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: e.target.email.value,
          password: e.target.password.value,
          name: e.target.name.value,
        }),
      });
      if (response.ok) {
        setCurrentRoute("home");
        setShowSignup(false);
        setError("Signup successful! Please login.");
      } else {
        setError("Signup failed");
      }
    } catch (err) {
      setError("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("http://localhost:9000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: e.target.email.value,
          password: e.target.password.value,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
        setIsLoggedIn(true);
        setCurrentRoute("home");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:9000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setIsLoggedIn(false);
      setUserProfile(null);
      setCurrentRoute("home");
    } catch (err) {
      setError("Logout failed");
    }
  };




  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % carouselImages.length);
  }, [carouselImages.length]);

  const prevSlide = useCallback(() => {
    setActiveSlide(
      (prev) => (prev - 1 + carouselImages.length) % carouselImages.length
    );
  }, [carouselImages.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);




  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:9000/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      setUserProfile(response.data);
    } catch (err) {
      setError('Failed to fetch user profile');
    }
  };




  const renderBorrowedBooks = () => {
    return borrowedBooks.map((book) => (
      <div key={book.id}>
        <h3>{book.title}</h3>
        <p>{book.author}</p>
      </div>
    ));
  };

  
  useEffect(() => {
    fetchBooks();
    if (isLoggedIn) {
      fetchUserProfile();
    }
  }, [isLoggedIn]);

  const renderHome = () => (
    <div className="w-full">
      <div className="relative w-full h-[400px] overflow-hidden">
        <div
          className="flex carousel-slide"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {carouselImages.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <img
                src={image}
                alt={`Library view ${index + 1}`}
                className="w-full h-[400px] object-cover"
              />
            </div>
          ))}
        </div>
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
  const renderBooks = () => (
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      {loading ? (
        <div className="col-span-3 text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
        </div>
      ) : error ? (
        <div className="col-span-3 text-center text-red-600">{error}</div>
      ) : (
        books.map((book) => (
          <div
            key={book.id}
            className="border p-4 rounded-lg shadow book-card hover:shadow-lg transition-shadow"
          >
            <h3 className="font-roboto text-xl">{book.title}</h3>
            <p className="text-gray-600">Category: {book.category}</p>
            <p className={book.available ? "text-green-600" : "text-red-600"}>
              {book.available ? "Available" : "Not Available"}
            </p>
            {book.available ? (
              <button
                onClick={() => handleBorrowBook(book.id)}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={loading || !isLoggedIn}
              >
                Borrow
              </button>
            ) : (
              book.borrowedBy === userProfile?.id && (
                <button
                  onClick={() => handleReturnBook(book.id)}
                  className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  disabled={loading}
                >
                  Return
                </button>
              )
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderAuth = () => (
    <div className="p-4 max-w-md mx-auto">
      {!isLoggedIn ? (
        showSignup ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <h2 className="text-2xl font-roboto mb-4">Sign Up</h2>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded"
              disabled={loading}
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : "Sign Up"}
            </button>
            <button
              type="button"
              onClick={() => setShowSignup(false)}
              className="w-full mt-2 text-blue-600"
            >
              Already have an account? Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-roboto mb-4">Login</h2>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded"
              disabled={loading}
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : "Login"}
            </button>
            <button
              type="button"
              onClick={() => setShowSignup(true)}
              className="w-full mt-2 text-blue-600"
            >
              Need an account? Sign Up
            </button>
          </form>
        )
      ) : (
        <div className="text-center">
          <i className="fas fa-user-circle text-6xl text-gray-600"></i>
          {userProfile ? (
            <>
              <h2 className="text-2xl font-roboto mt-4">{userProfile.name}</h2>
              <p className="text-gray-600">{userProfile.email}</p>
            </>
          ) : (
            <div className="mt-4">
              <i className="fas fa-spinner fa-spin text-blue-600"></i>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="mt-4 bg-red-600 text-white p-2 rounded"
            disabled={loading}
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : "Logout"}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-roboto">
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex flex-wrap justify-between items-center">
          <div className="text-xl font-bold">Library System</div>
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentRoute("home")}
              className={`hover:text-blue-200 ${
                currentRoute === "home" ? "text-blue-200" : ""
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentRoute("books")}
              className={`hover:text-blue-200 ${
                currentRoute === "books" ? "text-blue-200" : ""
              }`}
            >
              Books
            </button>
            <button
              onClick={() => setCurrentRoute("borrowed")}
              className={`hover:text-blue-200 ${
                currentRoute === "borrowed" ? "text-blue-200" : ""
              }`}
            >
              Borrowed
            </button>
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    setCurrentRoute("user");
                    setShowSignup(false);
                  }}
                  className={`hover:text-blue-200 ${
                    currentRoute === "user" && !showSignup
                      ? "text-blue-200"
                      : ""
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setCurrentRoute("user");
                    setShowSignup(true);
                  }}
                  className={`hover:text-blue-200 ${
                    currentRoute === "user" && showSignup ? "text-blue-200" : ""
                  }`}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <button
                onClick={() => setCurrentRoute("user")}
                className={`hover:text-blue-200 ${
                  currentRoute === "user" ? "text-blue-200" : ""
                }`}
              >
                Profile
              </button>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-grow">
        {currentRoute === "home" && renderHome()}
        {currentRoute === "books" && renderBooks()}
        {currentRoute === "borrowed" && renderBorrowedBooks()}
        {currentRoute === "user" && renderAuth()}
      </main>
      <footer className="bg-gray-800 text-white p-6 mt-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="footer-section">
              <h3 className="text-xl mb-4">Contact Us</h3>
              <p>Email: library@example.com</p>
              <p>Phone: (555) 123-4567</p>
            </div>
            <div className="footer-section">
              <h3 className="text-xl mb-4">Hours</h3>
              <p>Monday - Friday: 9am - 8pm</p>
              <p>Saturday: 10am - 6pm</p>
              <p>Sunday: Closed</p>
            </div>
            <div className="footer-section">
              <h3 className="text-xl mb-4">Follow Us</h3>
              <div className="flex space-x-4 social-icons">
                <i className="fab fa-facebook cursor-pointer hover:text-blue-400"></i>
                <i className="fab fa-twitter cursor-pointer hover:text-blue-400"></i>
                <i className="fab fa-instagram cursor-pointer hover:text-blue-400"></i>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
        }

        .book-card {
          animation: scaleIn 0.5s ease-out;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .book-card:hover {
          transform: translateY(-5px);
          animation: glow 2s infinite;
        }

        .nav-link:hover {
          transition: all 0.3s ease;
        }

        .carousel-slide {
          transition: transform 0.5s ease-in-out;
        }

        .footer-section {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }

        .footer-section:nth-child(1) { animation-delay: 0.1s; }
        .footer-section:nth-child(2) { animation-delay: 0.3s; }
        .footer-section:nth-child(3) { animation-delay: 0.5s; }

        .social-icons i {
          transition: transform 0.3s ease;
        }

        .social-icons i:hover {
          animation: bounce 0.8s infinite;
        }

        input, button {
          transition: all 0.3s ease;
        }

        button:hover {
          transform: translateY(-2px);
        }

        input:focus {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }

        tr {
          transition: background-color 0.3s ease;
        }

        tr:hover {
          background-color: rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}

export default MainComponent;