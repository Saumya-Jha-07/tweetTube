const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// try-catch ke form mai

/*

const asyncHandler = () => {}   // simple fn
const asyncHandler = (fn) => { () => {} }  // higher order fn ( fn inside fn)
const asyncHandler = () => async () => {} // async higher order fn

const asyncHandler = (fn) => async (err,req,res,next) => {
    try{
        await fn(err,req,res,next);
    } catch(err) {
        res.status(err.statusCode || 500).json({
            success : false,
            message : err.message
        }) 
    }
}

*/
