
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {
    title: 'Journalism Inline Tagging by BBC R&D and UCL Computer Science'
  });
};
