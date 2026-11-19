<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, bool $ok): void
{
    http_response_code($status);
    echo json_encode(['ok' => $ok]);
    exit;
}

function field(string $key, int $limit): string
{
    $value = $_POST[$key] ?? '';
    if (!is_string($value)) {
        return '';
    }
    return strlen($value) <= $limit ? trim($value) : '';
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, false);
}
if (!in_array($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '', ['same-origin', 'none'], true)) {
    respond(403, false);
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 8192) {
    respond(413, false);
}

$type = field('type', 30);
$phone = field('phone', 40);
$contact = $type === 'materials' ? field('contact', 80) : $phone;
$digits = preg_replace('/\D/', '', $contact);
$validPhone = preg_match('/^[+0-9(). -]+$/D', $contact) && strlen($digits) >= 7 && strlen($digits) <= 15;
$validTelegram = $type === 'materials' && preg_match('/^@[A-Za-z0-9_]{5,32}$/D', $contact);
if (!in_array($type, ['request', 'materials'], true) || field('consent', 10) !== 'on' || (!$validPhone && !$validTelegram)) {
    respond(422, false);
}

$configFile = dirname(__DIR__) . '/bitfinans-telegram.ini';
$config = is_readable($configFile) ? parse_ini_file($configFile, false, INI_SCANNER_RAW) : false;
$token = $config['bot_token'] ?? '';
if (!preg_match('/^\d+:[A-Za-z0-9_-]+$/D', $token) || !function_exists('curl_init')) {
    respond(503, false);
}

$lines = [$type === 'materials' ? 'БИТ.ФИНАНС · запрос материалов' : 'БИТ.ФИНАНС · новая заявка'];
$lines[] = ($validTelegram ? 'Telegram: ' : 'Телефон: ') . $contact;
$labels = [
    'page' => 'Страница', 'comment' => 'Задача', 'utm_source' => 'Источник',
    'utm_medium' => 'Тип рекламы', 'utm_campaign' => 'Кампания', 'group_id' => 'Группа',
    'ad_id' => 'Объявление', 'utm_content' => 'Содержание UTM', 'utm_term' => 'Ключевая фраза',
];
foreach ($labels as $key => $label) {
    $value = field($key, $key === 'comment' ? 2400 : 400);
    if ($value !== '') {
        $lines[] = $label . ': ' . $value;
    }
}

$curl = curl_init('https://api.telegram.org/bot' . $token . '/sendMessage');
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query(['chat_id' => '-5351626586', 'text' => implode("\n", $lines)]),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 12,
]);
$body = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);
$reply = is_string($body) ? json_decode($body, true) : null;
$delivered = $status === 200 && ($reply['ok'] ?? false) === true;
respond($delivered ? 200 : 502, $delivered);
