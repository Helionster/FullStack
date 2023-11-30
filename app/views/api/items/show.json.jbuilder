json.item do 
    json.extract! @item, :id, :name, :cost, :category, :stock, :description
    json.set! "image_url", @item.photo.attached? ? @item.photo.url : nil
end
