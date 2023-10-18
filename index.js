import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import _ from 'lodash';

const app = express();
const port = 3000;
app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// create a database connection
mongoose.connect("mongodb+srv://aliizzaldin7:OkmOkmNikola@cluster0.fsghd9w.mongodb.net/todolist", {useNewUrlParser: true});

//creat a schema
const itemSchema = mongoose.Schema({
    name: String,
});

//creata a model
const Item = mongoose.model("Item", itemSchema); 

//create a document

const item1 = new Item({
  name: "Welcome to your todolist",
});
const item2 = new Item({
  name: "try to add a new item today",
});
const item3 = new Item({
  name: "hit this button to delete ",
});

// a defualt array maybe it will be deleted 
const arrayDefault = [item1, item2, item3];

const listSchema = mongoose.Schema({
  name: String,
  item: [itemSchema]
});

const List = mongoose.model("List", listSchema);
 
// function getCurrentDateTime() {
//   const currentDate = new Date();
//   const options = { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' };
//   return currentDate.toLocaleDateString('en-US', options);
// }
// const formattedDate = getCurrentDateTime();
// console.log(formattedDate);  // Output: "Tue Oct 03 2023" (example for today's date)

app.get("/", (req, res) => {
  
  // const currentDateTime = //getCurrentDateTime();

  Item.find({})
  .then((items) => {
    if (items.length === 0) {
      // res.redirect('/'); // Redirect first
      return Item.insertMany(arrayDefault);
    } else {
      res.render("ii.ejs", {
        currentDateTime: "today",newListItems: items,
      });
      return Promise.resolve();  // Resolve the Promise for chaining
    }
  })
  .then(() => {
    console.log("Success");
  })
  .catch((error) => {
    console.error(error);
  });

});


 

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({ name: listName })
      .then(function(foundList) {
        if (foundList) {
          foundList.item.push(item);
          return foundList.save();
        } else {
          // List not found, create a new list
          const newList = new List({
            name: listName,
            item: [item], // Add the item to the new list
          });
          return newList.save();
        }
      })
      .then(() => {
        res.redirect('/' + listName);
      })
      .catch(function(err) {
        console.error(err);
      });
  }
});



app.post("/delete", (req, res) => {
  const itemCheckedId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(itemCheckedId)
    .then(() => {
      console.log("Item removed successfully");
      res.redirect('/');  // Redirect after successful removal
    })
    .catch((error) => {
      console.error("Error removing item:", error);
      res.status(500).send("Error removing item");  // You should handle errors appropriately
    });  
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {item: {_id: itemCheckedId}}})
    .then(function (foundList)
    {
      res.redirect("/" + listName);
    });
  }

  
});


app.get("/:customListName",(req,res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(function(foundList){
      if(!foundList) {
        const list = new List({
          name: customListName,
          item: arrayDefault
        });
      
        return list.save();
      } else {
        res.render("ii", {
          currentDateTime: foundList.name,
          newListItems: foundList.item // Changed from foundList.items to foundList.item
        });
      }
    })
    .then(() => {
      res.redirect("/" + customListName);
    })
    .catch(function(err) {
      console.error(err);
    });
});



// app.get("/work", (req, res) => {
//   res.render("work.ejs", { newListItems: arrayDefault});
//   res.redirect('/');
// });

// app.get("/delete", (req, res) => {
//   arrayDefault.pop();
//   res.redirect("/");
  
// });


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
