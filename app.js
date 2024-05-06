const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

const form = document.querySelector("form")

form.addEventListener("submit",(e)=>{
  e.preventDefault()

  const username = form.username.value
  const password = form.password.value

  const authenticated = authentication(username,password)
  if(authenticated){
    window.location.href = "dashboard.html"
  }else{
    alert("Invalid username or password")
  }
})

function authentication(username,password){
  if(username === "admin" && password === "admin"){
    return true
  }else{
    return false
  }
}

