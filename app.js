const express=require("express");
const bp=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app=express();

app.use(bp.urlencoded({extended:true}))
app.use(express.static("public"));

app.set("view engine","ejs");

mongoose.connect("mongodb+srv://admin-rounak:Mongodb@cluster0.2qhxb.mongodb.net/todolistDB",{useNewUrlParser:true});


const itemSchema = mongoose.Schema({
    name:String
});

const Item = mongoose.model("item",itemSchema);

const i1 = new Item({
    name:"Laundry"
});

const i2 = new Item({
    name:"Study"
});

const i3 = new Item({
    name: "work"
});

const defaultItems = [i1,i2,i3];


const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("list",listSchema);



//let items=["Laundry","Food","Study"];
//let worklist=[];





app.get("/",function(req,res){
    
    // let today=new Date();
    // let options={
    //     weekday:"long",
    //     day:"numeric",
    //     month:"long"
    // }
    // let day=today.toLocaleDateString("en-us",options);


    Item.find({},function(err,fitems){
        if(fitems.length===0){
            Item.insertMany(defaultItems,function (err) {
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successfully inserted");
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list",{listTitle:"Today",newitems:fitems});
        }

    });
});


app.post("/",function(req,res){
    const i=req.body.newItem;
    const lName = req.body.list;
    const item=new Item({
        name:i
    })

    if(lName==="Today"){
        item.save();
        res.redirect("/")
    }else{
        List.findOne({name:lName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+lName);
        })
    }


})

app.post("/delete",function(req,res){
    const checkedId = req.body.check;
    const listName = req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedId,function(err){
            if(!err){
                console.log("Sucessfully deleted.");
                res.redirect("/");
            }
        });
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedId}}},function(err,foundList){
            if(!err){
                console.log("Deleted");
                res.redirect("/"+listName);
            }
        })
    }
   
});

 

app.get("/:customListName",function(req,res){
    const listName=_.capitalize(req.params.customListName);

    List.findOne({name:listName},function(err,foundList){
        if(!err){
            if(!foundList){
                const list =new List({
                    name: listName,
                    items: defaultItems
                })
            
                list.save();
                res.redirect("/"+listName);
            }
            else{
                res.render("list",{listTitle:foundList.name,newitems:foundList.items})
            }
        }
    })

    
})


app.listen(process.env.PORT,function(){
    console.log("server running");
})