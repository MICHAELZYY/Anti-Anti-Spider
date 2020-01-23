var parse = function (e) {
    e = unescape(encodeURIComponent(e))
    for (var t = e.length, n = [], i = 0; i < t; i++)
        n[i >>> 2] |= (255 & e.charCodeAt(i)) << 24 - i % 4 * 8;
    return n
};


var en_methods = function (e, t, n) {
    var r;
    e.exports = (r = r || function (e, t) {
        var n = Object.create || function () {
            function e() {
            }

            return function (t) {
                var n;
                return e.prototype = t,
                    n = new e,
                    e.prototype = null,
                    n
            }
        }()
            , r = {}
            , o = r.lib = {}
            , l = o.Base = {
            extend: function (e) {
                var t = n(this);
                return e && t.mixIn(e),
                t.hasOwnProperty("init") && this.init !== t.init || (t.init = function () {
                        t.$super.init.apply(this, arguments)
                    }
                ),
                    t.init.prototype = t,
                    t.$super = this,
                    t
            },
            create: function () {
                var e = this.extend();
                return e.init.apply(e, arguments),
                    e
            },
            init: function () {
            },
            mixIn: function (e) {
                for (var t in e)
                    e.hasOwnProperty(t) && (this[t] = e[t]);
                e.hasOwnProperty("toString") && (this.toString = e.toString)
            },
            clone: function () {
                return this.init.prototype.extend(this)
            }
        }
            , c = o.WordArray = l.extend({
            init: function (e, t) {
                e = this.words = e || [],
                    this.sigBytes = null != t ? t : 4 * e.length
            },
            toString: function (e) {
                return (e || f).stringify(this)
            },
            concat: function (e) {
                var t = this.words
                    , n = e.words
                    , r = this.sigBytes
                    , o = e.sigBytes;
                if (this.clamp(),
                r % 4)
                    for (var i = 0; i < o; i++) {
                        var l = n[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                        t[r + i >>> 2] |= l << 24 - (r + i) % 4 * 8
                    }
                else
                    for (i = 0; i < o; i += 4)
                        t[r + i >>> 2] = n[i >>> 2];
                return this.sigBytes += o,
                    this
            },
            clamp: function () {
                var t = this.words
                    , n = this.sigBytes;
                t[n >>> 2] &= 4294967295 << 32 - n % 4 * 8,
                    t.length = e.ceil(n / 4)
            },
            clone: function () {
                var e = l.clone.call(this);
                return e.words = this.words.slice(0),
                    e
            },
            random: function (t) {
                for (var n, r = [], o = function (t) {
                    t = t;
                    var n = 987654321
                        , mask = 4294967295;
                    return function () {
                        var r = ((n = 36969 * (65535 & n) + (n >> 16) & mask) << 16) + (t = 18e3 * (65535 & t) + (t >> 16) & mask) & mask;
                        return r /= 4294967296,
                        (r += .5) * (e.random() > .5 ? 1 : -1)
                    }
                }, i = 0; i < t; i += 4) {
                    var l = o(4294967296 * (n || e.random()));
                    n = 987654071 * l(),
                        r.push(4294967296 * l() | 0)
                }
                return new c.init(r, t)
            }
        })
            , d = r.enc = {}
            , f = d.Hex = {
            stringify: function (e) {
                for (var t = e.words, n = e.sigBytes, r = [], i = 0; i < n; i++) {
                    var o = t[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                    r.push((o >>> 4).toString(16)),
                        r.push((15 & o).toString(16))
                }
                return r.join("")
            },
            parse: function (e) {
                for (var t = e.length, n = [], i = 0; i < t; i += 2)
                    n[i >>> 3] |= parseInt(e.substr(i, 2), 16) << 24 - i % 8 * 4;
                return new c.init(n, t / 2)
            }
        }
            , h = d.Latin1 = {
            stringify: function (e) {
                for (var t = e.words, n = e.sigBytes, r = [], i = 0; i < n; i++) {
                    var o = t[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                    r.push(String.fromCharCode(o))
                }
                return r.join("")
            },
            parse: function (e) {
                for (var t = e.length, n = [], i = 0; i < t; i++)
                    n[i >>> 2] |= (255 & e.charCodeAt(i)) << 24 - i % 4 * 8;
                return new c.init(n, t)
            }
        }
            , m = d.Utf8 = {
            stringify: function (e) {
                try {
                    return decodeURIComponent(escape(h.stringify(e)))
                } catch (e) {
                    throw new Error("Malformed UTF-8 data")
                }
            },
            parse: function (e) {
                return h.parse(unescape(encodeURIComponent(e)))
            }
        }
            , v = o.BufferedBlockAlgorithm = l.extend({
            reset: function () {
                this._data = new c.init,
                    this._nDataBytes = 0
            },
            _append: function (data) {
                "string" == typeof data && (data = m.parse(data)),
                    this._data.concat(data),
                    this._nDataBytes += data.sigBytes
            },
            _process: function (t) {
                var data = this._data
                    , n = data.words
                    , r = data.sigBytes
                    , o = this.blockSize
                    , l = r / (4 * o)
                    , d = (l = t ? e.ceil(l) : e.max((0 | l) - this._minBufferSize, 0)) * o
                    , f = e.min(4 * d, r);
                if (d) {
                    for (var h = 0; h < d; h += o)
                        this._doProcessBlock(n, h);
                    var m = n.splice(0, d);
                    data.sigBytes -= f
                }
                return new c.init(m, f)
            },
            clone: function () {
                var e = l.clone.call(this);
                return e._data = this._data.clone(),
                    e
            },
            _minBufferSize: 0
        })
            , y = (o.Hasher = v.extend({
            cfg: l.extend(),
            init: function (e) {
                this.cfg = this.cfg.extend(e),
                    this.reset()
            },
            reset: function () {
                v.reset.call(this),
                    this._doReset()
            },
            update: function (e) {
                return this._append(e),
                    this._process(),
                    this
            },
            finalize: function (e) {
                return e && this._append(e),
                    this._doFinalize()
            },
            blockSize: 16,
            _createHelper: function (e) {
                return function (t, n) {
                    return new e.init(n).finalize(t)
                }
            },
            _createHmacHelper: function (e) {
                return function (t, n) {
                    return new y.HMAC.init(e, n).finalize(t)
                }
            }
        }),
            r.algo = {});
        return r
    }(Math),
        r)
}

var encrypt_1 = function (e, t, n, r) {
    r = this.cfg.extend(r);
    var o = e.createEncryptor(n, r)
        , l = o.finalize(t)
        , c = o.cfg;
    return _.create({
        ciphertext: l,
        key: n,
        iv: c.iv,
        algorithm: e,
        mode: c.mode,
        padding: c.padding,
        blockSize: e.blockSize,
        formatter: r.format
    })
}

var config = function (e, t, n) {
    var r;
    e.exports = (r = r || function (e, t) {
        var n = Object.create || function () {
            function e() {
            }

            return function (t) {
                var n;
                return e.prototype = t,
                    n = new e,
                    e.prototype = null,
                    n
            }
        }()
            , r = {}
            , o = r.lib = {}
            , l = o.Base = {
            extend: function (e) {
                var t = n(this);
                return e && t.mixIn(e),
                t.hasOwnProperty("init") && this.init !== t.init || (t.init = function () {
                        t.$super.init.apply(this, arguments)
                    }
                ),
                    t.init.prototype = t,
                    t.$super = this,
                    t
            },
            create: function () {
                var e = this.extend();
                return e.init.apply(e, arguments),
                    e
            },
            init: function () {
            },
            mixIn: function (e) {
                for (var t in e)
                    e.hasOwnProperty(t) && (this[t] = e[t]);
                e.hasOwnProperty("toString") && (this.toString = e.toString)
            },
            clone: function () {
                return this.init.prototype.extend(this)
            }
        }
            , c = o.WordArray = l.extend({
            init: function (e, t) {
                e = this.words = e || [],
                    this.sigBytes = null != t ? t : 4 * e.length
            },
            toString: function (e) {
                return (e || f).stringify(this)
            },
            concat: function (e) {
                var t = this.words
                    , n = e.words
                    , r = this.sigBytes
                    , o = e.sigBytes;
                if (this.clamp(),
                r % 4)
                    for (var i = 0; i < o; i++) {
                        var l = n[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                        t[r + i >>> 2] |= l << 24 - (r + i) % 4 * 8
                    }
                else
                    for (i = 0; i < o; i += 4)
                        t[r + i >>> 2] = n[i >>> 2];
                return this.sigBytes += o,
                    this
            },
            clamp: function () {
                var t = this.words
                    , n = this.sigBytes;
                t[n >>> 2] &= 4294967295 << 32 - n % 4 * 8,
                    t.length = e.ceil(n / 4)
            },
            clone: function () {
                var e = l.clone.call(this);
                return e.words = this.words.slice(0),
                    e
            },
            random: function (t) {
                for (var n, r = [], o = function (t) {
                    t = t;
                    var n = 987654321
                        , mask = 4294967295;
                    return function () {
                        var r = ((n = 36969 * (65535 & n) + (n >> 16) & mask) << 16) + (t = 18e3 * (65535 & t) + (t >> 16) & mask) & mask;
                        return r /= 4294967296,
                        (r += .5) * (e.random() > .5 ? 1 : -1)
                    }
                }, i = 0; i < t; i += 4) {
                    var l = o(4294967296 * (n || e.random()));
                    n = 987654071 * l(),
                        r.push(4294967296 * l() | 0)
                }
                return new c.init(r, t)
            }
        })
            , d = r.enc = {}
            , f = d.Hex = {
            stringify: function (e) {
                for (var t = e.words, n = e.sigBytes, r = [], i = 0; i < n; i++) {
                    var o = t[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                    r.push((o >>> 4).toString(16)),
                        r.push((15 & o).toString(16))
                }
                return r.join("")
            },
            parse: function (e) {
                for (var t = e.length, n = [], i = 0; i < t; i += 2)
                    n[i >>> 3] |= parseInt(e.substr(i, 2), 16) << 24 - i % 8 * 4;
                return new c.init(n, t / 2)
            }
        }
            , h = d.Latin1 = {
            stringify: function (e) {
                for (var t = e.words, n = e.sigBytes, r = [], i = 0; i < n; i++) {
                    var o = t[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                    r.push(String.fromCharCode(o))
                }
                return r.join("")
            },
            parse: function (e) {
                for (var t = e.length, n = [], i = 0; i < t; i++)
                    n[i >>> 2] |= (255 & e.charCodeAt(i)) << 24 - i % 4 * 8;
                return new c.init(n, t)
            }
        }
            , m = d.Utf8 = {
            stringify: function (e) {
                try {
                    return decodeURIComponent(escape(h.stringify(e)))
                } catch (e) {
                    throw new Error("Malformed UTF-8 data")
                }
            },
            parse: function (e) {
                return h.parse(unescape(encodeURIComponent(e)))
            }
        }
            , v = o.BufferedBlockAlgorithm = l.extend({
            reset: function () {
                this._data = new c.init,
                    this._nDataBytes = 0
            },
            _append: function (data) {
                "string" == typeof data && (data = m.parse(data)),
                    this._data.concat(data),
                    this._nDataBytes += data.sigBytes
            },
            _process: function (t) {
                var data = this._data
                    , n = data.words
                    , r = data.sigBytes
                    , o = this.blockSize
                    , l = r / (4 * o)
                    , d = (l = t ? e.ceil(l) : e.max((0 | l) - this._minBufferSize, 0)) * o
                    , f = e.min(4 * d, r);
                if (d) {
                    for (var h = 0; h < d; h += o)
                        this._doProcessBlock(n, h);
                    var m = n.splice(0, d);
                    data.sigBytes -= f
                }
                return new c.init(m, f)
            },
            clone: function () {
                var e = l.clone.call(this);
                return e._data = this._data.clone(),
                    e
            },
            _minBufferSize: 0
        })
            , y = (o.Hasher = v.extend({
            cfg: l.extend(),
            init: function (e) {
                this.cfg = this.cfg.extend(e),
                    this.reset()
            },
            reset: function () {
                v.reset.call(this),
                    this._doReset()
            },
            update: function (e) {
                return this._append(e),
                    this._process(),
                    this
            },
            finalize: function (e) {
                return e && this._append(e),
                    this._doFinalize()
            },
            blockSize: 16,
            _createHelper: function (e) {
                return function (t, n) {
                    return new e.init(n).finalize(t)
                }
            },
            _createHmacHelper: function (e) {
                return function (t, n) {
                    return new y.HMAC.init(e, n).finalize(t)
                }
            }
        }),
            r.algo = {});
        return r
    }(Math),
        r)
}

// var o = function() {
//             for (var e = [], i = 0; i < 256; i++)
//                 e[i] = i < 128 ? i << 1 : i << 1 ^ 283;
//             var t = 0
//               , n = 0;
//             for (i = 0; i < 256; i++) {
//                 var r = n ^ n << 1 ^ n << 2 ^ n << 3 ^ n << 4;
//                 r = r >>> 8 ^ 255 & r ^ 99,
//                 o[t] = r,
//                 l[r] = t;
//                 var C = e[t]
//                   , _ = e[C]
//                   , x = e[_]
//                   , M = 257 * e[r] ^ 16843008 * r;
//                 c[t] = M << 24 | M >>> 8,
//                 d[t] = M << 16 | M >>> 16,
//                 f[t] = M << 8 | M >>> 24,
//                 h[t] = M,
//                 M = 16843009 * x ^ 65537 * _ ^ 257 * C ^ 16843008 * t,
//                 m[r] = M << 24 | M >>> 8,
//                 v[r] = M << 16 | M >>> 16,
//                 y[r] = M << 8 | M >>> 24,
//                 w[r] = M,
//                 t ? (t = C ^ e[e[e[x ^ C]]],
//                 n ^= e[e[n]]) : t = n = 1
//             }
//         }()
// var o = [99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164, 114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239, 170, 251]

// var m = [1374988112, 2118214995, 437757123, 975658646, 1001089995, 530400753, -1392879445, 1273168787, 540080725, -1384747530, -1999866223, -184398811, 1340463100, -987051049, 641025152, -1251826801, -558802359, 632953703, 1172967064, 1576976609, -1020300030, -2125664238, -1924753501, 1809054150, 59727847, 361929877, -1083344149, -1789765158, -725712083, 1484005843, 1239443753, -1899378620, 1975683434, -191989384, -1722270101, 666464733, -1092530250, -259478249, -920605594, 2110667444, 1675577880, -451268222, -1756286112, 1649639237, -1318815776, -1150570876, -25059300, -116905068, 1883793496, -1891238631, -1797362553, 1383856311, -1418472669, 1917518562, -484470953, 1716890410, -1293211641, 800440835, -2033878118, -751368027, 807962610, 599762354, 33778362, -317291940, -1966138325, -1485196142, -217582864, 1315562145, 1708848333, 101039829, -785096161, -995688822, 875451293, -1561111136, 92987698, -1527321739, 193195065, 1080094634, 1584504582, -1116860335, 1042385657, -1763899843, -583137874, 1306967366, -1856729675, 1908694277, 67556463, 1615861247, 429456164, -692196969, -1992277044, 1742315127, -1326955843, 126454664, -417768648, 2043211483, -1585706425, 2084704233, -125559095]
// var v = [1347548327, 1400783205, -1021700188, -1774573730, -885281941, -249586363, -1414727080, -1823743229, 1428173050, -156404115, -1853305738, 636813900, -61872681, -674944309, -2144979644, -1883938141, 1239331162, 1730525723, -1740248562, -513933632, 46346101, 310463728, -1551022441, -966011911, -419197089, -1793748324, -339776134, -627748263, 768917123, -749177823, 692707433, 1150208456, 1786102409, 2029293177, 1805211710, -584599183, -1229004465, 401639597, 1724457132, -1266823622, 409198410, -2098914767, 1620529459, 1164071807, -525245321, -2068091986, 486441376, -1795618773, 1483753576, 428819965, -2020286868, -1219331080, 598438867, -495826174, 1474502543, 711349675, 129166120, 53458370, -1702443653, -1512884472, -231724921, -1306280027, -1174273174, 1559041666, 730517276, -1834518092, -252508174, -1588696606, -848962828, -721025602, 533804130, -1966823682, -1657524653, -1599933611, 839224033, 1973745387, 957055980, -1438621457, 106852767, 1371368976, -113368694, 1033297158, -1361232379, 1179510461, -1248766835, 91341917, 1862534868, -10465259, 605657339, -1747534359, -863420349, 2003294622, -1112479678, -2012771957, 954669403, -612775698, 1201765386, -377732593, -906460130]
// var w = [-190361519, 1097159550, 396673818, 660510266, -1418998981, -1656360673, -94852180, -486304949, 821712160, 1986918061, -864644728, 38544885, -438830001, 718002117, 893681702, 1654886325, -1319482914, -1172609243, -368142267, -20913827, 796197571, 1290801793, 1184342925, -738605461, -1889540349, -1835231979, 1836772287, 1381620373, -1098699308, 1948373848, -529979063, -909622130, -1031181707, -1904641804, 1480485785, -1183720153, -514869570, -2001922064, 548169417, -835013507, -548792221, 439452389, 1362321559, 1400849762, 1685577905, 1806599355, -2120213250, 137073913, 1214797936, 1174215055, -563312748, 2079897426, 1943217067, 1258480242, 529487843, 1437280870, -349698126, -1245576401, -981755258, 923313619, 679998000, -1079659997, 57326082, 377642221, -820237430, 2041877159, 133361907, 1776460110, -621490843, 96392454, 878845905, -1493267772, 777231668, -212492126, -1964953083, -152341084, -2081670901, 1626319424, 1906247262, 1846563261, 562755902, -586793578, 1040559837, -423803315, 1418573201, -1000536719, 114585348, 1343618912, -1728371687, -1108764714, 1078185097, -643926169, -398279248, -1987344377, 425408743, -923870343, 2081048481, 1108339068, -2078357000]
// var y = [-1487908364, 1699970625, -1530717673, 1586903591, 1808481195, 1173430173, 1487645946, 59984867, -95084496, 1844882806, 1989249228, 1277555970, -671330331, -875051734, 1149249077, -1550863006, 1514790577, 459744698, 244860394, -1058972162, 1963115311, -267222708, -1750889146, -104436781, 1608975247, -1667951214, 2062270317, 1507497298, -2094148418, 567498868, 1764313568, -935031095, -1989511742, 2037970062, 1047239000, 1910319033, 1337376481, -1390940024, -1402549984, 984907214, 1243112415, 830661914, 861968209, 2135253587, 2011214180, -1367032981, -1608712575, 731183368, 1750626376, -48656571, 1820824798, -122203525, -752637069, 48394827, -1890065633, -1423284651, 671593195, -1039978571, 2073724613, 145085239, -2014171096, -1515052097, 1790575107, -2107839210, 472615631, -1265457287, -219090169, -492745111, -187865638, -1093335547, 1646252340, -24460122, 1402811438, 1436590835, -516815478, -344611594, -331805821, -274055072, -1626972559, 273792366, -1963377119, 104699613, 95345982, -1119466010, -1917480620, 1560637892, -730921978, 369057872, -81520232, -375925059, 1137477952, -1636341799, 1119727848, -1954019447, 1530455833, -287606328, 172466556, 266959938, 516552836, 0]

var make_list = function () {

    // , t = e.lib.BlockCipher
    // , n = e.algo
    var o = []
        , l = []
        , c = []
        , d = []
        , f = []
        , h = []
        , m = []
        , v = []
        , y = []
        , w = [];
    !function () {
        for (var e = [], i = 0; i < 256; i++)
            e[i] = i < 128 ? i << 1 : i << 1 ^ 283;
        var t = 0
            , n = 0;
        for (i = 0; i < 256; i++) {
            var r = n ^ n << 1 ^ n << 2 ^ n << 3 ^ n << 4;
            r = r >>> 8 ^ 255 & r ^ 99,
                o[t] = r,
                l[r] = t;
            var C = e[t]
                , _ = e[C]
                , x = e[_]
                , M = 257 * e[r] ^ 16843008 * r;
            c[t] = M << 24 | M >>> 8,
                d[t] = M << 16 | M >>> 16,
                f[t] = M << 8 | M >>> 24,
                h[t] = M,
                M = 16843009 * x ^ 65537 * _ ^ 257 * C ^ 16843008 * t,
                m[r] = M << 24 | M >>> 8,
                v[r] = M << 16 | M >>> 16,
                y[r] = M << 8 | M >>> 24,
                w[r] = M,
                t ? (t = C ^ e[e[e[x ^ C]]],
                    n ^= e[e[n]]) : t = n = 1
        }
    }();
    return [o, l, c, d, f, h, m, v, y, w]
}

var doreset = function () {
    var C = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54]
    var e = r
    // , t = e.lib.BlockCipher
    // , n = e.algo
    ls = make_list()
        , o = ls[0]
        , l = ls[1]
        , c = ls[2]
        , d = ls[3]
        , f = ls[4]
        , h = ls[5]
        , m = ls[6]
        , v = ls[7]
        , y = ls[8]
        , w = ls[9];
    !function () {
        for (var e = [], i = 0; i < 256; i++)
            e[i] = i < 128 ? i << 1 : i << 1 ^ 283;
        var t = 0
            , n = 0;
        for (i = 0; i < 256; i++) {
            var r = n ^ n << 1 ^ n << 2 ^ n << 3 ^ n << 4;
            r = r >>> 8 ^ 255 & r ^ 99,
                o[t] = r,
                l[r] = t;
            var C = e[t]
                , _ = e[C]
                , x = e[_]
                , M = 257 * e[r] ^ 16843008 * r;
            c[t] = M << 24 | M >>> 8,
                d[t] = M << 16 | M >>> 16,
                f[t] = M << 8 | M >>> 24,
                h[t] = M,
                M = 16843009 * x ^ 65537 * _ ^ 257 * C ^ 16843008 * t,
                m[r] = M << 24 | M >>> 8,
                v[r] = M << 16 | M >>> 16,
                y[r] = M << 8 | M >>> 24,
                w[r] = M,
                t ? (t = C ^ e[e[e[x ^ C]]],
                    n ^= e[e[n]]) : t = n = 1
        }
    }();
    console.log(o);
    this._key = [1633838648, 845361465, 1684092002, 809056354];
    if (!this._nRounds || this._keyPriorReset !== this._key) {
        for (var e = this._keyPriorReset = this._key, t = [1633838648, 845361465, 1684092002, 809056354], n = 16 / 4, r = 4 * ((this._nRounds = n + 6) + 1), l = this._keySchedule = [], c = 0; c < r; c++)
            if (c < n)
                l[c] = t[c];
            else {
                var d = l[c - 1];
                c % n ? n > 6 && c % n == 4 && (d = o[d >>> 24] << 24 | o[d >>> 16 & 255] << 16 | o[d >>> 8 & 255] << 8 | o[255 & d]) : (d = o[(d = d << 8 | d >>> 24) >>> 24] << 24 | o[d >>> 16 & 255] << 16 | o[d >>> 8 & 255] << 8 | o[255 & d],
                    d ^= C[c / n | 0] << 24),
                    l[c] = l[c - n] ^ d
            }
        for (var f = this._invKeySchedule = [], h = 0; h < r; h++)
            c = r - h,
                d = h % 4 ? l[c] : l[c - 4],
                f[h] = h < 4 || c <= 4 ? d : m[o[d >>> 24]] ^ v[o[d >>> 16 & 255]] ^ y[o[d >>> 8 & 255]] ^ w[o[255 & d]]
    }

    console.log(this._invKeySchedule)
    console.log(this._keySchedule)

}
var concat = function (e) {   //  e 是列表长度为12的数据
    var t = this.words
        , n = e.words
        , r = this.sigBytes
        , o = e.sigBytes;
    if (this.clamp(),
    r % 4)
        for (var i = 0; i < o; i++) {
            var l = n[i >>> 2] >>> 24 - i % 4 * 8 & 255;
            t[r + i >>> 2] |= l << 24 - (r + i) % 4 * 8
        }
    else
        for (i = 0; i < o; i += 4)
            t[r + i >>> 2] = n[i >>> 2];
    return this.sigBytes += o,
        this
}
var clamp = function () {
    var t = this.words
        , n = this.sigBytes;
    t[n >>> 2] &= 4294967295 << 32 - n % 4 * 8,
        t.length = e.ceil(n / 4)
}

var stringfy = function (t) {
    //  最终生成函数
    var n = 48
        , map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    // clamp();
    for (var r = [], i = 0; i < n; i += 3)
        for (var o = (t[i >>> 2] >>> 24 - i % 4 * 8 & 255) << 16 | (t[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255) << 8 | t[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255, l = 0; l < 4 && i + .75 * l < n; l++)
            r.push(map.charAt(o >>> 6 * (3 - l) & 63));
    var c = map.charAt(64);
    if (c)
        for (; r.length % 4;)
            r.push(c);
    console.log(11, r.join(""))
    return r.join("")
    // clamp= function() {
    //             var t = this.words
    //               , n = this.sigBytes;
    //             t[n >>> 2] &= 4294967295 << 32 - n % 4 * 8,
    //             t.length = e.ceil(n / 4)
    //         }
}


var clamp = function () {
    var t = this.words
        , n = this.sigBytes;
    t[n >>> 2] &= 4294967295 << 32 - n % 4 * 8,
        t.length = e.ceil(n / 4)
}

var pad = function (data, e) {
    //data.sigBytes         +=1
    for (var t = 4 * e, n = t - 47 % t, r = n << 24 | n << 16 | n << 8 | n, o = [], i = 0; i < n; i += 4) {
        o.push(r);
    }

    console.log(11, o)
}

var cc_t = function n(t, n, r, p) {
    // var o = this._iv;
    // if (o) {
    //     var l = o;
    //     this._iv = e
    // } else
    // l = p;
    console.log(t)
    for (var i = 0; i < r; i++){
        t[n + i] ^= p[i]
        }
    console.log(22, t)
    return t
}

var doCryptBlock = function (e, t, n, r, o, l, c, d) {
        ls = make_list()
        r = ls[2]
        o = ls[3]
        l = ls[4]
        c = ls[5]
        d = ls[0]

        for (var f = this._nRounds, h = e[t] ^ n[0], m = e[t + 1] ^ n[1], v = e[t + 2] ^ n[2], y = e[t + 3] ^ n[3], w = 4, C = 1; C < f; C++) {
            var _ = r[h >>> 24] ^ o[m >>> 16 & 255] ^ l[v >>> 8 & 255] ^ c[255 & y] ^ n[w++]
                , x = r[m >>> 24] ^ o[v >>> 16 & 255] ^ l[y >>> 8 & 255] ^ c[255 & h] ^ n[w++]
                , M = r[v >>> 24] ^ o[y >>> 16 & 255] ^ l[h >>> 8 & 255] ^ c[255 & m] ^ n[w++]
                , L = r[y >>> 24] ^ o[h >>> 16 & 255] ^ l[m >>> 8 & 255] ^ c[255 & v] ^ n[w++];
            h = _,
                m = x,
                v = M,
                y = L
        }
        _ = (d[h >>> 24] << 24 | d[m >>> 16 & 255] << 16 | d[v >>> 8 & 255] << 8 | d[255 & y]) ^ n[w++],
            x = (d[m >>> 24] << 24 | d[v >>> 16 & 255] << 16 | d[y >>> 8 & 255] << 8 | d[255 & h]) ^ n[w++],
            M = (d[v >>> 24] << 24 | d[y >>> 16 & 255] << 16 | d[h >>> 8 & 255] << 8 | d[255 & m]) ^ n[w++],
            L = (d[y >>> 24] << 24 | d[h >>> 16 & 255] << 16 | d[m >>> 8 & 255] << 8 | d[255 & v]) ^ n[w++],
            e[t] = _,
            e[t + 1] = x,
            e[t + 2] = M,
            e[t + 3] = L
        console.log('e', e)
    return e
    },

    data = 'url=/v1/topic/7/thread$time=1579765295236000000'

t = parse('abf82c19da4b098b')
n = parse(data)

console.log(t)
console.log(n)
doreset()
pad(n, 4)


cc_t(n, 0, 4, t)
e = [336595461, 487915542, 269370379, 1393954637, 1953002085, 1633952884, 1768777021, 825571129, 926300217, 909652529, 875573296, 808464385]
k = [1633838648, 845361465, 1684092002, 809056354, 1919274044, 1074199813, 610781543, 341766405, 683976646, 1757567683, 1285919652, 1492869793, 594449836, 1269616495, 118054091, 1609711210, -1562601629, -378513396, -294058809, -1316275539, -1889795413, 1714182823, -2007671200, 970876109, -1306542151, -734796514, 1550236542, 1706614707, -1635659020, 1253193706, 383028372, 1936479015, 1315708539, 81668497, 302687493, 1634137634, 1714326932, 1659937797, 1895432448, 295499554, -1908007402, -323569133, -1672692973, -1915728847]

e_1 = doCryptBlock(e, 0, k)

ee_1 = cc_t(e_1, 4, 4, e_1.slice(0,4))

e_2 = doCryptBlock(ee_1, 4, k)

ee_2 = cc_t(e_1, 8, 4, e_1.slice(4,8))

e_3 = doCryptBlock(ee_2, 8, k)

stringfy(e_3)