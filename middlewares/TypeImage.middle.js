const setImageType = (type) => (req, res, next) => {
    req.imageType = type; // تعيين نوع الصورة في `req`
    next();
  };
  module.exports=setImageType;