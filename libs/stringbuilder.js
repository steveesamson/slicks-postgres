/**
 * Created by steve Samson <stevee.samson@gmail.com> on 2/10/14.
 */
module.exports = function(initext)
{
    var content = [];
    (initext && content.push(initext));

    return {
        append:function(text){
            content.push(text);
            return this;
        },
        toString:function(){
           return content.join('');
        }
    };
};

