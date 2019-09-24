$(document).ready(function () {
  $(".orders-item__submit").each(function (index) {
    $(this).on('click', function (e) {
      e.preventDefault();
      var data = {
        body: 'submit',
        user: $(".orders-item__user")[index].innerHTML
      };
      $.ajax({
        type: 'post',
        url: '/',
        data: data,
        dataType: 'json',
        success: function (msg) {
          $($(".orders-item__status")[index]).html(msg.status);
          $($(".orders-item__status")[index]).addClass('status_new').delay(5000).queue(function () { $(this).removeClass('status_new'); $(this).dequeue();});
        }
      });
    });
  });
  $(".orders-item__deny").each(function (index) {
    $(this).on('click', function (e) {
      e.preventDefault();
      var data = {
        body: 'deny',
        user: $(".orders-item__user")[index].innerHTML
      };
      $.ajax({
        type: 'post',
        url: '/',
        data: data,
        dataType: 'json',
        success: function (msg) {
          $($(".orders-item__status")[index]).html(msg.status);
          $($(".orders-item__status")[index]).addClass('status_new').delay(5000).queue(function () { $(this).removeClass('status_new'); $(this).dequeue();});
        }
      });
    });
  });
  $(".orders-item__done").each(function (index) {
    $(this).on('click', function (e) {
      e.preventDefault();
      var data = {
        body: 'done',
        user: $(".orders-item__user")[index].innerHTML
      };
      $.ajax({
        type: 'post',
        url: '/',
        data: data,
        dataType: 'json',
        success: function (msg) {
          $($(".orders-item__status")[index]).html(msg.status);
          $($(".orders-item__status")[index]).addClass('status_new').delay(5000).queue(function () { $(this).removeClass('status_new'); $(this).dequeue();});
        }
      });
    });
  });
});