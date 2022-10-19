const express = require("express");
const cors = require("cors");
const {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} = require("firebase/firestore");
const { db } = require("./firebase");
const app = express();
app.use(cors());

function findClosest(arr, target) {
  let n = arr.length;
  console.log(n);
  console.log(arr);
  console.log(target);

  for (let i = n - 1; i >= 0; i--) {
    if (parseFloat(arr[i].amount * 2) <= parseFloat(target)) {
      return arr[i].amount;
    }
  }
  return -1;
}
let counter = 0;
const findResult = async () => {
  const totalAmount = [];
  let temp = 0;

  let moneyLeftInPool = 0;
  let previousCasinoProfit = 0;
  let winningColor = "";
  console.log("interval going:" + counter);
  counter++;
  await getDocs(collection(db, "USERS"))
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        if (doc.data().playing) {
          totalAmount.push({
            amount: doc.data().amountBetted,
            bettedBy: doc.id,
            colorSelected: doc.data().colorSelected,
          });
          temp += doc.data().amountBetted;
        }
      });
    })
    .then(() => {
      if (temp !== 0 && !isNaN(temp)) {
        console.log(temp);
        getDoc(doc(db, "Casino", "Profit"))
          .then((document) => {
            moneyLeftInPool = document.data().moneyLeftInPool;
            previousCasinoProfit = document.data().currentCasinoProfit;
          })
          .then(() => {
            const currentCasinoProfit = (temp * 15) / 100;
            const amountLeft = temp - currentCasinoProfit + moneyLeftInPool;
            console.log(amountLeft);
            totalAmount.sort((a, b) => {
              return a.amount - b.amount;
            });
            const closest = findClosest(totalAmount, amountLeft);
            console.log(closest);
            if (closest === -1) {
              totalAmount.map((item) => {
                updateDoc(doc(db, "USERS", item.bettedBy), {
                  result: "LOSS",
                  winningColor: "gray",
                })
                  .then(() => {
                    console.log("Updated");
                  })
                  .catch((err) => console.log(err));
              });
              const currentMoneyLeftInPool = amountLeft;
              const totalCasinoProfit =
                previousCasinoProfit + currentCasinoProfit;

              updateDoc(doc(db, "Casino", "Profit"), {
                moneyLeftInPool: currentMoneyLeftInPool,
                currentCasinoProfit: totalCasinoProfit,
              })
                .then(() => {
                  console.log("Profits Updated");
                })
                .catch((err) => console.log(err));
            } else {
              totalAmount.map((item) => {
                if (item.amount === closest) {
                  console.log("here is win");
                  winningColor = item.colorSelected;
                  updateDoc(doc(db, "USERS", item.bettedBy), {
                    result: "WIN",
                    winningColor: item.colorSelected,
                  })
                    .then(() => {
                      console.log("Updated");
                    })
                    .catch((err) => console.log(err));
                } else {
                  updateDoc(doc(db, "USERS", item.bettedBy), {
                    result: "LOSS",
                    winningColor: winningColor,
                  })
                    .then(() => {
                      console.log("Updated");
                    })
                    .catch((err) => console.log(err));
                }
              });
              const currentMoneyLeftInPool = amountLeft - closest * 2;
              const totalCasinoProfit =
                previousCasinoProfit + currentCasinoProfit;

              updateDoc(doc(db, "Casino", "Profit"), {
                moneyLeftInPool: currentMoneyLeftInPool,
                currentCasinoProfit: totalCasinoProfit,
              })
                .then(() => {
                  console.log("Profits Updated");
                })
                .catch((err) => console.log(err));
            }
          });
      }
    });

  setTimeout(findResult, 7000);
};

findResult();
