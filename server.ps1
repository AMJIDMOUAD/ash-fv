param([switch]$Stop)
if ($Stop) { Stop-Process -Name powershell -Force -ErrorAction SilentlyContinue; return }

$port = 3000
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "==================================="
Write-Host " Summit Studio Server running"
Write-Host " Open: http://localhost:$port/"
Write-Host " Close this window to stop."
Write-Host "==================================="

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $res = $ctx.Response

  # Add CORS headers
  $res.Headers.Add("Access-Control-Allow-Origin", "*")
  $res.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS")
  $res.Headers.Add("Access-Control-Allow-Headers", "Content-Type")

  # Handle OPTIONS preflight
  if ($req.HttpMethod -eq "OPTIONS") {
    $res.StatusCode = 204
    $res.Close()
    continue
  }

  # API endpoint
  if ($req.Url.AbsolutePath -eq "/send-audit" -and $req.HttpMethod -eq "POST") {
    $reader = New-Object System.IO.StreamReader($req.InputStream)
    $json = $reader.ReadToEnd()
    $reader.Close()
    $d = $json | ConvertFrom-Json

    $subject = "New Free Audit Request - " + $d.name + " (" + $d.business + ")"
    $body = "New Free Audit Request`r`n`r`nName: $($d.name)`r`nBusiness: $($d.business)`r`nEmail: $($d.email)`r`nPhone: $($d.phone)"

    try {
      $smtp = New-Object Net.Mail.SmtpClient("smtp.gmail.com", 587)
      $smtp.EnableSsl = $true
      $smtp.Credentials = New-Object System.Net.NetworkCredential("ash8518@gmail.com", "uusp valv sxpg oagw")
      $msg = New-Object Net.Mail.MailMessage("ash8518@gmail.com", "ash8518@gmail.com", $subject, $body)
      $smtp.Send($msg)

      $res.StatusCode = 200
      $bytes = [Text.Encoding]::UTF8.GetBytes('{"ok":true}')
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host "Email sent: $($d.name) - $($d.business)"
    } catch {
      $res.StatusCode = 500
      $err = $_.Exception.Message
      $jsonErr = '{"ok":false,"error":"' + $err.Replace('"', '\"') + '"}'
      $bytes = [Text.Encoding]::UTF8.GetBytes($jsonErr)
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host "ERROR: $err"
    }
    $res.Close()
    continue
  }

  # Static files
  $path = $req.Url.AbsolutePath
  if ($path -eq "/") { $path = "/index.html" }

  $filePath = [System.IO.Path]::Combine($root, $path.TrimStart("/"))
  if (Test-Path $filePath -PathType Leaf) {
    $ext = [System.IO.Path]::GetExtension($filePath)
    $mime = @{
      ".html" = "text/html; charset=utf-8"
      ".css" = "text/css; charset=utf-8"
      ".js" = "application/javascript; charset=utf-8"
      ".svg" = "image/svg+xml"
      ".png" = "image/png"
      ".jpg" = "image/jpeg"
      ".ico" = "image/x-icon"
    }
    $res.ContentType = "application/octet-stream"
    if ($mime.ContainsKey($ext)) { $res.ContentType = $mime[$ext] }
    $data = [System.IO.File]::ReadAllBytes($filePath)
    $res.OutputStream.Write($data, 0, $data.Length)
  } else {
    $res.StatusCode = 404
    $bytes = [Text.Encoding]::UTF8.GetBytes("404 Not Found")
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  }
  $res.Close()
}

$listener.Stop()
