<?php
// Бэкенд приглашения на PHP: гости и ответы хранятся в JSON-файле рядом со скриптом.
// Тот же API, что и apps-script/Code.gs, поэтому сайт и admin.html работают с любым из них.
//
// Установка: положите этот файл на любой хостинг с PHP 7+ (папка должна быть доступна
// для записи), откройте его в браузере — должно ответить {"ok":false,"error":"action"}.
// Ссылку на файл вставьте в WEDDING.api в assets/common.js. Логин и пароль админки
// придумываются при первом входе в admin.html.
//
// Данные лежат в guests.data.php: первой строкой там PHP-команда exit (см. GUARD),
// поэтому по ссылке его содержимое не отдаётся. Сбросить пароль: удалить из файла блок "admin".

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store');

const DATA_FILE = __DIR__ . '/guests.data.php';
const GUARD = "<?php exit; ?>\n";

function out($obj)
{
    echo json_encode($obj, JSON_UNESCAPED_UNICODE);
    exit;
}

function now()
{
    return gmdate('Y-m-d\TH:i:s\Z');
}

// На некоторых хостингах нет расширения mbstring — тогда режем по символам через preg
function str_len($s)
{
    return function_exists('mb_strlen') ? mb_strlen($s) : preg_match_all('/./us', $s);
}

function clean($s)
{
    $s = trim(preg_replace('/\s+/u', ' ', (string)$s));
    if (function_exists('mb_substr')) return mb_substr($s, 0, 80);
    preg_match('/^.{0,80}/us', $s, $m);
    return $m[0];
}

function new_id($guests)
{
    $abc = 'abcdefghjkmnpqrstuvwxyz23456789';
    $taken = array_column($guests, 'id');
    do {
        $id = '';
        for ($i = 0; $i < 7; $i++) $id .= $abc[random_int(0, strlen($abc) - 1)];
    } while (in_array($id, $taken, true));
    return $id;
}

$p = $_GET;
$action = isset($p['action']) ? $p['action'] : '';

// Файл открывается с блокировкой: два гостя, ответившие одновременно, не затрут друг друга
$fh = fopen(DATA_FILE, 'c+');
if (!$fh) out(['ok' => false, 'error' => 'storage']);
flock($fh, LOCK_EX);
$raw = stream_get_contents($fh);
$db = json_decode(substr($raw, strlen(GUARD)), true);
if (!is_array($db)) $db = ['admin' => null, 'guests' => []];

$save = function () use ($fh, &$db) {
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, GUARD . json_encode($db, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($fh);
};
$find = function ($id) use (&$db) {
    foreach ($db['guests'] as $i => $g) if ($id !== '' && $g['id'] === $id) return $i;
    return -1;
};

$login = isset($p['login']) ? trim($p['login']) : '';
$key = isset($p['key']) ? (string)$p['key'] : '';
$isAdmin = !empty($db['admin']) && hash_equals($db['admin']['login'], $login) && password_verify($key, $db['admin']['hash']);

switch ($action) {
    case 'status':
        out(['ok' => true, 'configured' => !empty($db['admin'])]);

    // Первый вход в админку: задаём логин и пароль (только пока они не заданы)
    case 'setup':
        if (!empty($db['admin'])) out(['ok' => false, 'error' => 'configured']);
        if (str_len($login) < 3 || str_len($key) < 6) out(['ok' => false, 'error' => 'weak']);
        $db['admin'] = ['login' => $login, 'hash' => password_hash($key, PASSWORD_DEFAULT)];
        $save();
        out(['ok' => true]);

    case 'guest':
        $i = $find(isset($p['id']) ? $p['id'] : '');
        if ($i < 0 || !empty($db['guests'][$i]['shared'])) out(['ok' => false]);
        $g = $db['guests'][$i];
        out(['ok' => true, 'name' => $g['name'], 'answer' => $g['answer'], 'people' => $g['people']]);

    case 'answer':
        $yes = isset($p['answer']) && $p['answer'] === 'yes';
        $people = $yes ? max(1, min(20, (int)(isset($p['people']) ? $p['people'] : 1))) : 0;
        $i = $find(isset($p['id']) ? $p['id'] : '');
        if ($i >= 0 && empty($db['guests'][$i]['shared'])) {
            $db['guests'][$i]['answer'] = $yes ? 'yes' : 'no';
            $db['guests'][$i]['people'] = $people;
            $db['guests'][$i]['answeredAt'] = now();
        } else {
            // ответ по общей ссылке: гость сам вписал имя
            $name = clean(isset($p['name']) ? $p['name'] : '');
            if ($name === '') out(['ok' => false, 'error' => 'name']);
            $db['guests'][] = ['id' => new_id($db['guests']), 'name' => $name, 'answer' => $yes ? 'yes' : 'no',
                'people' => $people, 'answeredAt' => now(), 'createdAt' => now(), 'shared' => true];
        }
        $save();
        out(['ok' => true]);

    case 'list':
    case 'add':
    case 'remove':
        if (!$isAdmin) out(['ok' => false, 'error' => 'key']);
        if ($action === 'list') out(['ok' => true, 'guests' => $db['guests']]);
        if ($action === 'add') {
            $name = clean(isset($p['name']) ? $p['name'] : '');
            if ($name === '') out(['ok' => false, 'error' => 'name']);
            $g = ['id' => new_id($db['guests']), 'name' => $name, 'answer' => '', 'people' => 0,
                'answeredAt' => '', 'createdAt' => now(), 'shared' => false];
            $db['guests'][] = $g;
            $save();
            out(['ok' => true, 'guest' => $g]);
        }
        $i = $find(isset($p['id']) ? $p['id'] : '');
        if ($i >= 0) {
            array_splice($db['guests'], $i, 1);
            $save();
        }
        out(['ok' => $i >= 0]);

    default:
        out(['ok' => false, 'error' => 'action']);
}
