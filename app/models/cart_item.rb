class CartItem < ApplicationRecord
    validates :user_id, :item_id, :quantity, :name, :description, :cost, :image_url, presence: true
end