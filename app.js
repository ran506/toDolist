const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL, {useNewUrlParser:true});
const _ = require("lodash");
const date =  require(__dirname + "/date.js");
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
//use array to store,
const itemSchema = {
    name: String
};
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
    name:"welcome"
});
const item2 = new Item({
    name:"hello World"
});
const defaultList = [item1,item2];
const listSchema = {
    name: String,
    items:[itemSchema] // will have items array with item document associated
};
const List = mongoose.model("List",listSchema); //after create model, you are ready to create document 
// const itemList = [item1,item2];
// Item.insertMany(itemList,function(err){
//     if(err) console.log(err);
//     else{
//         console.log("successful");
//     }
// });
 var items =[];
var worklist=[];
// var today = new Date();
// var currentday = today.getDay();
// var options = {
//     weekday : "long",
//     day: "numeric",
//     month:"long"
// };
// var day = today.toLocaleDateString("en-US", options);
var listTitle = "";
app.get("/",(req,res)=>{
    let day = date();
    listTitle = day;

    Item.find({}, function(err,foundItems){
        if (foundItems.length === 0) {
           
            Item.insertMany(defaultList,function(err){
                if(err) console.log(err);
                else{
                    console.log("successful");
                }
            });
            res.redirect("/");
        }
        else {
            res.render('list',{listTitle:listTitle, listItems:foundItems});
        }
    });

    // if(currentday === 6 || currentday === 0) {
    //    day = "weekend";
    // }
    // else day = "weekday";
    
    // switch(currentday) {
    //     case 0:
    //         day = "Sunday";
    //         break;
    //     case 1:
    //         day = "Monday";
    //         break;
    //     case 2:
    //         day = "Tuesday";
    //         break;
    //     case 3: 
    //         day = "Wednesday"
    //         break;
    //     case 4:
    //         day = "Thursday";
    //         break;
    //     case 5: 
    //         day = "Friday";
    //         break;
    //     case 6:
    //         day = "Saturday";
    //         break;
    //     default: 
    //        console.log("day error");
    // }
    
    
});
app.post("/", function(req,res) {
    var itemName = req.body.newItem;
    // if(req.body.list === "work") {
    //     worklist.push(item);
    //     res.redirect("/work");
    // }
    // else {
    //     items.push(item);
    //     res.redirect("/");
    // }
    const item= new Item({
        name:itemName
    });
    const listName = req.body.list;
    if (listName === date()) {
        item.save();
        res.redirect("/");
    }else {
        List.findOne({name:listName},function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
    
});
app.get("/work", function(req,res) {
    listTitle = "work";
    res.render("list",{listTitle:listTitle,listItems:worklist});
});
app.post("/delete",function(req,res) {
    const checkedItem = req.body.checkBox;
    const listName = req.body.listName;
    if (listName === date()) {
        Item.findByIdAndRemove(checkedItem,function(err) {
            if(!err) {
                console.log("successfully deleted");
                res.redirect("/");
            }
        });
    }
    else {
        //find the list document first and then remove the listitem with the name pass over            
        //remove document from array
        List.findOneAndUpdate(
            {name:listName},
            {$pull:{items: {_id:checkedItem}}},
            function(err,foundList){
                if(!err) {

                    console.log(checkedItem);
                    res.redirect("/" + listName);
                }
            });
    }
});
app.get("/:customList", function(req,res){
    var listName = _.capitalize(req.params.customList);
    List.findOne({name:listName}, function(err, foundlist){
        if (!err) {
            if (!foundlist) {
                const list = new List({
                    name: listName,
                    items: defaultList
                });
                list.save();
                res.redirect("/:customList");
            }
            else {
                res.render("list", {listTitle:foundlist.name, listItems:foundlist.items});
            }
        }
    });

    
});
app.listen(3000,function(){
    console.log("server started on port 3000");
})