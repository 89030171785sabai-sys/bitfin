<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, bool $ok, array $data = []): void
{
    http_response_code($status);
    echo json_encode(['ok' => $ok] + $data);
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

function nextLeadNumber(string $path): int
{
    $previousMask = umask(0077);
    $file = @fopen($path, 'c+');
    umask($previousMask);
    if ($file === false) {
        throw new RuntimeException('Lead counter unavailable');
    }
    try {
        if (!flock($file, LOCK_EX)) {
            throw new RuntimeException('Lead counter unavailable');
        }
        $current = stream_get_contents($file);
        if ($current === false || ($current !== '' && !ctype_digit($current)) || (int) $current === PHP_INT_MAX) {
            throw new RuntimeException('Invalid lead counter');
        }
        $next = (string) ((int) $current + 1);
        if (!rewind($file) || fwrite($file, $next) !== strlen($next) || !fflush($file)) {
            throw new RuntimeException('Lead counter could not be saved');
        }
        return (int) $next;
    } finally {
        fclose($file);
    }
}

function messageLine(string $label, string $value, bool $bold = false): string
{
    $heading = $bold ? '<b>' . $label . ':</b>' : $label . ':';
    return $heading . '   ' . htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
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
$validTelegram = preg_match('/^@[A-Za-z0-9_]{1,32}$/D', $contact);
if (!in_array($type, ['request', 'materials'], true) || field('consent', 10) !== 'on' || (!$validPhone && !$validTelegram)) {
    respond(422, false);
}

$configFile = dirname(__DIR__) . '/bitfinans-telegram.ini';
$config = is_readable($configFile) ? parse_ini_file($configFile, false, INI_SCANNER_RAW) : false;
$token = $config['bot_token'] ?? '';
if (!preg_match('/^\d+:[A-Za-z0-9_-]+$/D', $token) || !function_exists('curl_init')) {
    respond(503, false);
}

try {
    $number = nextLeadNumber(dirname($configFile) . '/bitfinans-lead-number');
} catch (RuntimeException $error) {
    error_log($error->getMessage());
    respond(503, false);
}

$date = new DateTimeImmutable('now', new DateTimeZone('Europe/Moscow'));
$page = trim(field('page', 250), '/');
$page = preg_replace('/(?:-bit-finans)?\.html$/', '', $page);
$separator = '- - - - - -';
$comment = field('comment', 1600);
$lines = [
    messageLine('Заявка', '№' . $number, true),
    messageLine('Дата - время', $date->format('d.m.Y - H:i'), true),
    $separator,
    messageLine($validTelegram ? 'Telegram' : 'Телефон', $contact, true),
    messageLine('Коротко о задаче', $comment !== '' ? $comment : '—', true),
    $separator,
    messageLine('Страница', $page !== '' && $page !== 'index' ? $page : 'главная'),
    messageLine('Форма', $type === 'materials' ? 'запрос материалов' : 'заявка на консультацию'),
];
$labels = [
    'utm_source' => 'Источник',
    'utm_medium' => 'Тип рекламы', 'utm_campaign' => 'Кампания', 'group_id' => 'Группа',
    'ad_id' => 'Объявление', 'utm_content' => 'Содержание UTM', 'utm_term' => 'Ключевая фраза',
];
foreach ($labels as $key => $label) {
    $value = field($key, 250);
    if ($value !== '') {
        $lines[] = messageLine($label, $value);
    }
}

$curl = curl_init('https://api.telegram.org/bot' . $token . '/sendMessage');
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query([
        'chat_id' => '-5351626586',
        'text' => implode("\n", $lines),
        'parse_mode' => 'HTML',
        'link_preview_options' => '{"is_disabled":true}',
    ]),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 12,
]);
$body = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);
$reply = is_string($body) ? json_decode($body, true) : null;
$delivered = $status === 200 && ($reply['ok'] ?? false) === true;
if (!$delivered) {
    respond(502, false);
}

$data = [];
if ($type === 'materials') {
    $downloadPath = '/assets/materials/bitfinans-materials.zip';
    if (is_file(__DIR__ . $downloadPath) && is_readable(__DIR__ . $downloadPath)) {
        $data['download_url'] = $downloadPath;
    }
}
respond(200, true, $data);
