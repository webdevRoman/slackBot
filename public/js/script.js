const submits = document.querySelectorAll('.orders-item__submit')
const denies = document.querySelectorAll('.orders-item__deny')
const dones = document.querySelectorAll('.orders-item__done')
const users = document.querySelectorAll('.orders-item__user')
const statuses = document.querySelectorAll('.orders-item__status')

function watchButtons(buttons, buttonType) {
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    button.addEventListener('click', (e) => {
      e.preventDefault()
      const data = {
        body: buttonType,
        user: users[i].innerHTML
      }
      post(window.location.href, JSON.stringify(data))
      .then((res) => {
        statuses[i].innerHTML = JSON.parse(res).status
        statuses[i].classList.add('status_new')
        setTimeout(() => {
          statuses[i].classList.remove('status_new')
        }, 5000)
      })
    })
  }
}
function post(url, requestuestBody) {
  return new Promise(function(succeed, fail) {
    var request = new XMLHttpRequest()
    request.open("POST", url, true)
    request.setRequestHeader('Content-Type', 'application/json; charset=utf-8')
    request.addEventListener("load", function() {
      if (request.status < 400)
        succeed(request.responseText)
      else
        fail(new Error("Request failed: " + request.statusText))
    })
    request.addEventListener("error", function() {
      fail(new Error("Network error"))
    })
    request.send(requestuestBody)
  })
}

watchButtons(submits, 'submit')
watchButtons(denies, 'deny')
watchButtons(dones, 'done')