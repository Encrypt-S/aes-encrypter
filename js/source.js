const CryptoJS = require('crypto-js')
const $ = require('jquery')
const Clipboard = require('clipboard')
const qrcode = require('qrcode-generator')

const maxLengthQR = 23648

$( document ).ready(function() {
  const clipboard = new Clipboard('#copy-output')
  clipboard.on('success', function(e) {
    e.clearSelection()
  })

  $('#toggle-password').change(() => {
    if($('#toggle-password').is(':checked')){
      $('#password').prop('type', 'text')
    } else {
      $('#password').prop('type', 'password')
    }
  })

  $('#encrypt-decrypt').change(() => {
    $('#output-container').hide()
    $('#output-text').text('')
    if($('#encrypt-decrypt').is(':checked')){
      $('#textarea-label').text('Text to decrypt')
      $('#submit span').text('Decrypt')
      $('#submit i').text('vpn_key')
      $('#submit').addClass('indigo')
      $('#output-label').text('Decrypted output')
      $('#copy-output').addClass('indigo')
      $('#show-qr').addClass('indigo')
    } else {
      $('#textarea-label').text('Text to encrypt')
      $('#submit span').text('Encrypt')
      $('#submit i').text('lock')
      $('#submit').removeClass('indigo')
      $('#output-label').text('Encrypted output')
      $('#copy-output').removeClass('indigo')
      $('#show-qr').removeClass('indigo')
    }
  })

  $('#password, #text').on('input', () => {
    $('#output-container').hide()
    $('#output-text').text('')
  })

  $('#submit').click((event) => {
    event.preventDefault()
    const text = $('#text').val()
    const password = $('#password').val()

    if(password === '' || text === '') return

    console.log(text)

    $('#show-qr').show()
    $('#copy-output').show()
    $('#output-container').show()

    if($('#encrypt-decrypt').is(':checked')){
      decrypt(text, password)
    } else {
      encrypt(text, password)
    }


  })

  function decrypt(text, password) {
    try {
      const bytes  = CryptoJS.AES.decrypt(text, password)
      const output = bytes.toString(CryptoJS.enc.Utf8)
      if (output === ''){
        showError('Unable to decrypt')
        return
      }
      $('#output-text').text(output)
      console.log(output)
      return
    } catch(error) {
      showError('Unable to decrypt', error)
      return
    }
  }

  function encrypt(text, password) {
    try {
      const output = CryptoJS.AES.encrypt(text, password)
      if (output === ''){
        showError('Unable to encrypt')
        return
      }
      $('#output-text').text(output)
      return
    } catch(error) {
      showError('Unable to encrypt', error)
      return
    }
  }

  function showError(message, error) {
    if (error) console.log(error)
    $('#show-qr').hide()
    $('#copy-output').hide()
    $('#output-text').text(message)
  }

  $('#clear-form').click(() => {
    event.preventDefault()
    $('#password').val('')
    $('#text').val('')
    $('#output-container').hide()
    $('#output-text').text('')
  })

  $('#show-qr').click(() => {
    try {
      const text = $('#output-text').text()
      const typeNumber = 0;
      const errorCorrectionLevel = 'L';
      const qrCode = qrcode(typeNumber, errorCorrectionLevel);
      qrCode.addData(text);
      qrCode.make();
      $('#qrcode').html(qrCode.createImgTag(2, 8))
    } catch(error) {
      console.log(error)
      $('#qrcode').html(
        '<h4>Unable to create QR Code</h4>'+
        '<p>Maximum encrypted string length is 23,648.</p>'+
        '<p>You can still copy the encrypted string and save it.</p>'
      )
    }

    $('#qr-modal, #modal-overlay').fadeIn()
  })

  $('.modal-close').click(() => {
    $('#qrcode').html('')
    $('#qr-modal, #modal-overlay').fadeOut()
  })

});
