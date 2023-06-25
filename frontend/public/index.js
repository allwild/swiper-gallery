const swiperWrapper = document.querySelector(".swiper-wrapper");
const getPics = document.querySelector(".getpics");
const sendButton = document.querySelector(".send");
const inputField = document.querySelector(".upload");
const myList = document.querySelector("#myList");
const myForm = document.querySelector("#myForm");
const title = document.querySelector(".title");
const artist = document.querySelector(".artist");
const form = document.querySelector("form");
const localHostWithPort = "http://127.0.0.1:8001";
const inputFields =document.querySelectorAll('input')

const uploadLabel = document.querySelector("#uploadlabel")

const swiperFrame = document.querySelector('.swiper')
const swiper = new Swiper(".swiper", {
  // Optional parameters
  loop: true,

  // If we need pagination
  pagination: {
    el: ".swiper-pagination",
  },

  // Navigation arrows
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  // And if we need scrollbar
  /* scrollbar: {
    el: ".swiper-scrollbar",
  }, */
});

function getData() {
  fetch("/getpics")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((imgObject) => {
        swiperWrapper.insertAdjacentHTML(
          "afterbegin",
          `
        <div class="swiper-slide">
          <div class="tile">
            <img src="http://127.0.0.1:8001/${imgObject.url}" alt="">
            <i class="fa-regular fa-trash-can fa-xl delete"></i>
            <div class="titlebar">
              <span>${imgObject.artist}</span>: <span>${imgObject.title}</span>
            </div>
          </div>
        </div>
      `
        );
      });
    })
    .catch((error) => console.error(error));
}

function uploadData(locator) {
  const picData = [
    {
      url: locator,
      date_of_upload: new Date().toISOString().slice(0, 10),
      time_of_upload: new Date().toLocaleTimeString("en-US", { hour12: false }),
      title: title.value,
      artist: artist.value,
    },
  ];

  fetch("/upload-data", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(picData),
  });
}

function addEventListenerToButtons() {

  const deleteButtons = document.querySelectorAll(".delete");
  deleteButtons.forEach((deleteButton) => {
    deleteButton.addEventListener("click", (e) => {
      e.preventDefault();
      const imageName = deleteButton.parentElement.children[0].src.replace(
        "http://127.0.0.1:8001/",
        ""
      );

      fetch(`/delete/${imageName}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageName: imageName }),
      }).then(() => {
        Array.from(swiperWrapper.children).forEach((img) => img.remove());
        setTimeout(getData, 50)
        setTimeout(addEventListenerToButtons, 200);
      });
    });
  });
  
  
  const titleBars = document.querySelectorAll(".titlebar")
  titleBars.forEach(titlebar => {

    swiperFrame.addEventListener("mouseover", () => {
      titlebar.classList.remove("titledown")
      titlebar.classList.add("titleup")
      titlebar.previousElementSibling.classList.remove("verticalout")
      titlebar.previousElementSibling.classList.add("verticalin")
    })
    
    
    swiperFrame.addEventListener("mouseout", () => {
      titlebar.classList.remove("titleup")
      titlebar.classList.add("titledown")
      titlebar.previousElementSibling.classList.remove("verticalin")
      titlebar.previousElementSibling.classList.add("verticalout")
    })

  })
  
}

setTimeout(addEventListenerToButtons, 60);


window.addEventListener("load", (e) => {
  e.preventDefault();
  getData();
});


sendButton.addEventListener("click", (event) => {
  event.preventDefault();

  const imageFile = inputField.files[0];
  const formDataPic = new FormData();

  if (title.value && artist.value && inputField.value ) {

    formDataPic.append("image", imageFile);
    fetch("/upload", {
      method: "POST",
      body: formDataPic,
    })
      .then((response) => response.json())
      .then((data) => uploadData(data))
      .then(() => {
        Array.from(swiperWrapper.children).forEach((img) => img.remove());
        setTimeout(getData, 50)
        setTimeout(addEventListenerToButtons, 200);
        inputFields.forEach(field => field.value = "")
      })
      .catch((error) => console.error(error));

  } else {
    alert("Oops! It looks like you've forgotten to attach a photo or enter details!")
  }
});


uploadLabel.addEventListener('change', (event) => {
  inputField.click()
});