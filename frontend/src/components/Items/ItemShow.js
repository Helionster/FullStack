import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from 'react-router-dom';
import * as sessionActions from "../../store/session";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './ItemShow.css';
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { getItem, fetchItem } from '../../store/item.js';
import { createCartItem, updateCartItem } from "../../store/cartitems.js"
import ReadOnlyStarRating from "../StarRating/ReadableStarRating.js"
import ReviewStarRating from "../StarRating/ReviewStarRating.js"
import OnlyStars from "../StarRating/OnlyStars.js"
import { fetchReviews, removeReview } from "../../store/itemReviews.js"

const ItemShow = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [username, setUsername] = useState(""); 
  const session = useSelector(state => state.session);
  const [cartQuantity, setCartQuantity] = useState(0); 
  const { itemId } = useParams();
  const item = useSelector(getItem(itemId)) || {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState("Place Your Order");
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const cartItems = useSelector(state => state.cartItems);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const allReviews = Object.values(useSelector(state => state.reviews));
  const filteredReviews = Object.values(allReviews.filter(review => review.itemId === item.id));
  const itemRatings = filteredReviews.reduce((total, review) => total + review.ratings, 0);
  const totalRatings = filteredReviews.length;
  const averageRating = totalRatings > 0 ? Math.ceil((itemRatings / totalRatings) * 10) / 10 : 0;    
  
  useEffect(() => {
    if (session && session.user && session.user.username) {
      setUsername(session.user.username);
    } else {
      setUsername("User");
    }
  }, [session]);

  useEffect(() => {
    dispatch(fetchItem(itemId)); 
    dispatch(fetchReviews(itemId));
  }, [dispatch, itemId ]);

  const redirectToHomePage = async(e) => {
    history.push("/")
  }

  const homesignout = async (e) => {
    e.preventDefault();
    await dispatch(sessionActions.logout());
    history.push('/login');
  };

  const redirectCart = () => {
    history.push('/cart');
  };
  
  function toggleDropdown() {
    const dropdown = document.querySelector('.showitemdropdown');
    if (dropdown) {
      dropdown.classList.toggle('active');
    }
  }
  
  document.addEventListener('click', function (event) {
    const dropdown = document.querySelector('.showitemdropdown');
    if (dropdown && !dropdown.contains(event.target)) {
      dropdown.classList.remove('active');
    }
  });

  function updateQuantity(quantity) {
    setSelectedQuantity(quantity);
    const dropdown = document.querySelector('.showitemdropdown');
    dropdown.classList.remove('active');

    const qtyTextElement = document.getElementById('selectedQuantity');
    if (qtyTextElement) {
      qtyTextElement.textContent = quantity;
    }
  }

  const addToCart = () => {
    if (!session.user) {
      history.push('/login');
      return;
    }
  
    const itemDetails = item;
  
    if (itemDetails) {
      const existingCartItem = Object.values(cartItems).find(
        cartItem => cartItem.item_id === itemDetails.id
      );
  
      if (existingCartItem) {
        const updatedQuantity = existingCartItem.quantity + selectedQuantity;
        dispatch(updateCartItem({ 
          id: existingCartItem.id,
          quantity: updatedQuantity,
          user_id: session.user.id,
          item_id: itemDetails.id,
          name: itemDetails.name,
          description: itemDetails.description,
          cost: itemDetails.cost,
          image_url: itemDetails.imageUrl,
        }));
      } else {
        const cartItem = {
          user_id: session.user.id,
          item_id: itemDetails.id,
          quantity: selectedQuantity,
          name: itemDetails.name,
          description: itemDetails.description,
          cost: itemDetails.cost,
          image_url: itemDetails.imageUrl,
        };
  
        dispatch(createCartItem(cartItem));
      }
    }
  };  
  
  const openModal = () => {
    setIsModalOpen(true);
    document.body.classList.add("amazeonmodalopen");
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    document.body.classList.remove("amazeonmodalopen");
  };

  const handlePlaceOrder = () => {
    if (isOrderPlaced) {
      return; 
    }

    setOrderStatus("Processing");

    setTimeout(() => {
      setOrderStatus("On its way!");

      setTimeout(() => {
        setOrderStatus("Order Placed!");
        setIsOrderPlaced(true);
      }, 2000);
    }, 2000);
  };

  const Modal = ({ closeModal }) => {
    return (
      <div className="amazeonmodal">
        <div className="amazeonmodalcontent">
          <div className="amazeonmodalheader">
            <h2>Buy now: {item.name}</h2>
            <button onClick={closeModal} className="amazeonmodalclosebutton">
              &times;
            </button>
          </div>
          <div className="amazeonmodalbody">
            <p>Total: ${item.cost * selectedQuantity}</p>
          </div>
          <div className="amazeonmodalfooter">
            <button className="amazeonmodalorderbutton" onClick={handlePlaceOrder}>{orderStatus}</button>
          </div>
        </div>
      </div>
    );
  };

  const renderCartQuantity = () => {
    const totalQuantity = Object.values(cartItems).reduce((total, item) => total + item.quantity, 0);
    const cartQuantityText = totalQuantity > 99 ? "99+" : totalQuantity;
    return cartQuantityText;
  };

  const cartNumberClass = cartQuantity > 99 ? "bigcartnumber" : cartQuantity >= 10 ? "mediumcartnumber" : "smallcartnumber";

  useEffect(() => {
    const totalQuantity = Object.values(cartItems).reduce((total, item) => total + item.quantity, 0);
    setCartQuantity(totalQuantity);
  }, [cartItems]);

  const writeReview = () => {
    if (!session.user) {
      history.push('/login');
      return;
    }

    history.push({
      pathname: '/items/:item_id/review',
      state: { item: item }
    });
  };

  const editingReview = (reviewId) => {
    history.push({
      pathname: `/items/${itemId}/editreview`,
      state: { item: item, reviewId: reviewId }
    });
  };

  const deletingReview = async (reviewId) => {
    dispatch(removeReview(reviewId));
  };

  return (
    <>
      <div className="navbar">
        <div className="amazeonhome">
          <img className="amazeonhomepage" src={"https://amazeon-seeds.s3.amazonaws.com/Logo+For+Home+Page.jpeg"} onClick={redirectToHomePage} alt="amazeonhomelogo" />
        </div>

        <div className="searchcontainer">
          <div className="categoriescontainer">
            <select className="categories">
              <option value="AllDepartments">All Departments</option>
              <option value="AlexaSkills">Alexa Skills</option>
            </select>
          </div>
          <input type="text" className="searchbox" placeholder="Search Amazeon" />
          <button className="searchbutton">
            <div className="searchbuttonicon">
              <FontAwesomeIcon icon={faSearch} />
            </div>
          </button>
        </div>

        <div className="dropdown">
          <div className="greeting">Hello, {username}</div>
          <button className="dropdownbutton">Account & Lists</button>
          <div className="accountdropdowncontent">
            <h3>Your Account</h3>
            {session.user ? (
              <div className="homesignoutlink">
                <a href="/login" onClick={homesignout}>Sign Out</a>
              </div>
            ) : (
              <div className="homesigninlink">
                <a href="/signup">Sign Up</a>
                <a href="/login">Sign In</a>
              </div>
            )}
          </div>  
        </div>

        <button className="amazeoncartsection" onClick={redirectCart}>
          <img className="amazeoncartimg" src={"https://amazeon-seeds.s3.amazonaws.com/Cart.jpg"} alt="" />
          <div className={`cartcontainer ${cartNumberClass}`}>
            <div className="number">{renderCartQuantity()}</div>
            <div className="cart">
              <h3>Cart</h3>
            </div>
          </div>
        </button>
      </div>

      <div className="itemcontent">
        <div className="showitemcategory">{item && item?.category ? item.category : "Unknown Category"}</div>
        <div className="itemdetails">
        <div className="itemshowcontainer">
            {item && (
              <img className="itemshowimg" src={item.imageUrl} alt={item.name} />
            )}
          </div>

          <div className="itemspecs">
            <div className="showitemname">{item && item?.name ? item.name : " Unknown Name"}
            <ReviewStarRating rating={averageRating} totalRatings={totalRatings}></ReviewStarRating>
              <hr className="separator" />
              <div className="descriptioncontainer">About this item:
                <div className="itemdescription">{item && item?.description ? item.description : "Unknown Description"}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="showitemdiv">
          <div className={`showitemcost ${item && item.stock <= 0 ? 'out-of-stock' : ''}`}>
            Cost: ${item && item?.cost ? item.cost : " Unknown Cost"}
          </div>
          <div className={`instock ${item && item.stock <= 0 ? 'out-of-stock' : ''}`}>
            {item && item.stock > 0 ? "In Stock" : "Out Of Stock"}
          </div>
          
          <div className={`showitemdropdown ${item && item.stock <= 0 ? 'out-of-stock' : ''}`}>
            <label className={`showdropdownbutton ${isModalOpen ? 'modalopen' : ''}`} onClick={() => toggleDropdown()}>
              <div className="qtxcontainer">
                Qty: <span className="qtytext" id="selectedQuantity">1</span>
              </div>
            </label>
            <div className="showdropdowncontent" id="dropdownContent">
              <label htmlFor="quantity1" onClick={() => updateQuantity(1)}>1</label>
              <label htmlFor="quantity2" onClick={() => updateQuantity(2)}>2</label>
              <label htmlFor="quantity3" onClick={() => updateQuantity(3)}>3</label>
              <label htmlFor="quantity4" onClick={() => updateQuantity(4)}>4</label>
              <label htmlFor="quantity5" onClick={() => updateQuantity(5)}>5</label>
              <label htmlFor="quantity6" onClick={() => updateQuantity(6)}>6</label>
              <label htmlFor="quantity7" onClick={() => updateQuantity(7)}>7</label>
              <label htmlFor="quantity8" onClick={() => updateQuantity(8)}>8</label>
              <label htmlFor="quantity9" onClick={() => updateQuantity(9)}>9</label>
              <label htmlFor="quantity10" onClick={() => updateQuantity(10)}>10</label>
            </div>
          </div>

          {item && item.stock > 0 && (
            <>
              <button className="addtocartbutton" onClick={addToCart} disabled={item.stock <= 0}> 
                Add to Cart
              </button>

              <button className="buynow" onClick={openModal} disabled={item.stock <= 0}>
                Buy Now
              </button>
            </>
          )}

          {isModalOpen && (
            <Modal closeModal={closeModal} />
          )}
        </div>
      </div>

      <hr className="reviewsseperator" />

      <div className="reviews"> Customers say
        <div className="customerreviews"> Customer reviews
          <ReadOnlyStarRating rating={averageRating}></ReadOnlyStarRating> 
          <div className="totalratings">{totalRatings} global ratings</div>

          <hr className="formseperator" />

          <div className="reviewthisproduct">
            Review This Product
            <div className="sharethoughts">
              Share your thoughts with other customers
              <div className="writeareview" onClick={() => writeReview()}>Write A Customer Review</div>
            </div>
            <hr className="formseperator" />
          </div>
        </div>

        <div className="otherreviews">
          {filteredReviews.map((review) => (
            <div className="individual-review" key={review.reviewId}>
              <div className="author">{review.author}</div>
              <OnlyStars rating={review.ratings}></OnlyStars> 
              <div className="reviewbody">{review.body}</div>
              {session.user && (session.user.username === review.author) && (
                <div className="editanddelete">
                  <div className="edit">
                    <div onClick={() => editingReview(review.reviewId)}>Edit</div>
                  </div>
                  <div className="delete"> 
                    <div onClick={() => deletingReview(review.reviewId)}>Delete</div>
                  </div> 
                </div>
              )}
              <br></br>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ItemShow;