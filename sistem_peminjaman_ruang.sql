SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- =========================
-- DATABASE
-- =========================
CREATE DATABASE IF NOT EXISTS `siprus_db`;
USE `siprus_db`;

-- =========================
-- TABLE GEDUNG
-- =========================
CREATE TABLE `gedung` (
  `id_gedung` int(11) NOT NULL,
  `nama_gedung` varchar(50) NOT NULL,
  `zona` varchar(10) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB;

INSERT INTO `gedung` VALUES
(1,'GKB 2','A',NOW(),NOW()),
(2,'GKB 2','B',NOW(),NOW()),
(3,'GKB 3',NULL,NOW(),NOW()),
(4,'NRC',NULL,NOW(),NOW()),
(5,'LABKES',NULL,NOW(),NOW()),
(6,'SPORT CENTER',NULL,NOW(),NOW()),
(7,'GEDUNG C RS',NULL,NOW(),NOW());

-- =========================
-- TABLE USERS
-- =========================
CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `role` enum('mahasiswa','admin_rt','kepala_rt') NOT NULL,
  `aktif` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB;

INSERT INTO `users` VALUES
(1,'Admin Rumah Tangga','admin_rt',1,NOW(),NOW()),
(2,'Kepala Rumah Tangga','kepala_rt',1,NOW(),NOW()),
(3,'UKM KOMUNIKASI','mahasiswa',1,NOW(),NOW()),
(4,'PDIPM','mahasiswa',1,NOW(),NOW()),
(5,'UKM TSPM','mahasiswa',1,NOW(),NOW()),
(6,'BEM FK','mahasiswa',1,NOW(),NOW());

-- =========================
-- TABLE RUANGAN
-- =========================
CREATE TABLE `ruangan` (
  `id_ruangan` int(11) NOT NULL,
  `id_gedung` int(11) NOT NULL,
  `nama_ruangan` varchar(50) NOT NULL,
  `lantai` int(11) DEFAULT NULL,
  `kapasitas` int(11) DEFAULT NULL,
  `aktif` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB;

INSERT INTO `ruangan` VALUES
(1,1,'R.203',2,40,1,NOW(),NOW()),
(2,1,'R.204',2,40,1,NOW(),NOW()),
(3,2,'R.309',3,50,1,NOW(),NOW()),
(4,3,'R.106',1,60,1,NOW(),NOW()),
(5,4,'R.406',4,50,1,NOW(),NOW()),
(6,5,'R.117',1,40,1,NOW(),NOW()),
(7,6,'SPORT CENTER ATAS',1,150,1,NOW(),NOW()),
(8,6,'SPORT CENTER BAWAH',1,200,1,NOW(),NOW()),
(9,7,'R.101',1,40,1,NOW(),NOW());

-- =========================
-- TABLE PEMINJAMAN
-- =========================
CREATE TABLE `peminjaman` (
  `id_peminjaman` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `id_ruangan` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `jam_mulai` time NOT NULL,
  `jam_selesai` time NOT NULL,
  `nama_pengguna` varchar(100) NOT NULL,
  `keperluan` text,
  `locked_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_peminjaman`)
) ENGINE=InnoDB;

INSERT INTO `peminjaman` VALUES
(1,3,1,'2025-12-05','12:00:00','15:00:00','UKM KOMUNIKASI','Keperluan peminjaman 1','2026-01-10 17:23:57','2026-01-10 17:23:57'),
(2,4,1,'2025-12-05','16:00:00','20:00:00','PDIPM','Keperluan peminjaman 2','2026-01-10 17:24:08','2026-01-10 17:24:08'),
(3,6,7,'2025-12-07','18:00:00','20:00:00','BEM FK','Keperluan peminjaman 3','2026-01-10 17:24:18','2026-01-10 17:24:18');

-- =========================
-- TABLE RIWAYAT PEMINJAMAN (BARU)
-- =========================
CREATE TABLE `riwayat_peminjaman` (
  `id_riwayat` int(11) NOT NULL AUTO_INCREMENT,
  `id_peminjaman` int(11) NOT NULL,
  `status_sebelumnya` enum('draft','locked','confirmed','expired') DEFAULT NULL,
  `status_baru` enum('draft','locked','confirmed','expired') NOT NULL,
  `keterangan` varchar(255) DEFAULT NULL,
  `keperluan` text,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_riwayat`)
) ENGINE=InnoDB;

INSERT INTO `riwayat_peminjaman`
(`id_riwayat`,`id_peminjaman`,`status_sebelumnya`,`status_baru`,`keterangan`,`keperluan`)
VALUES
(1,1,'draft','locked','Pengajuan dikunci','Keperluan peminjaman 1'),
(2,1,'locked','confirmed','Disetujui admin & kepala RT','Keperluan peminjaman 1'),
(3,2,'draft','locked','Menunggu persetujuan','Keperluan peminjaman 2'),
(4,3,'draft','confirmed','Disetujui langsung','Keperluan peminjaman 3');

CREATE TABLE `laporan_peminjaman` (
  `id_laporan` int(11) NOT NULL AUTO_INCREMENT,
  `id_riwayat` int(11) NOT NULL,
  `id_peminjaman` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_ruangan` int(11) NOT NULL,
  `status_sebelumnya` enum('draft','locked','confirmed','expired') DEFAULT NULL,
  `status_baru` enum('draft','locked','confirmed','expired') NOT NULL,
  `keterangan` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `tanggal` date NOT NULL,
  `jam_mulai` time NOT NULL,
  `jam_selesai` time NOT NULL,
  `nama_pengguna` varchar(100) NOT NULL,
  `keperluan` text,
  `nama_ruangan` varchar(50) NOT NULL,
  `lantai` int(11) DEFAULT NULL,
  `nama_gedung` varchar(50) NOT NULL,
  `zona` varchar(10) DEFAULT NULL,
  `nama_user` varchar(100) NOT NULL,
  `role` enum('mahasiswa','admin_rt','kepala_rt') NOT NULL,
  `locked_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_laporan`),
  KEY `fk_laporan_riwayat` (`id_riwayat`),
  KEY `fk_laporan_peminjaman` (`id_peminjaman`),
  CONSTRAINT `fk_laporan_riwayat` FOREIGN KEY (`id_riwayat`) REFERENCES `riwayat_peminjaman` (`id_riwayat`),
  CONSTRAINT `fk_laporan_peminjaman` FOREIGN KEY (`id_peminjaman`) REFERENCES `peminjaman` (`id_peminjaman`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Populate laporan_peminjaman for existing riwayat_peminjaman
INSERT INTO `laporan_peminjaman` (
  `id_riwayat`,
  `id_peminjaman`,
  `id_user`,
  `id_ruangan`,
  `status_sebelumnya`,
  `status_baru`,
  `keterangan`,
  `tanggal`,
  `jam_mulai`,
  `jam_selesai`,
  `nama_pengguna`,
  `keperluan`,
  `nama_ruangan`,
  `lantai`,
  `nama_gedung`,
  `zona`,
  `nama_user`,
  `role`,
  `locked_at`
)
SELECT
  rp.id_riwayat,
  rp.id_peminjaman,
  p.id_user,
  p.id_ruangan,
  rp.status_sebelumnya,
  rp.status_baru,
  rp.keterangan,
  p.tanggal,
  p.jam_mulai,
  p.jam_selesai,
  p.nama_pengguna,
  COALESCE(rp.keperluan, p.keperluan),
  r.nama_ruangan,
  r.lantai,
  g.nama_gedung,
  g.zona,
  u.nama,
  u.role,
  p.locked_at
FROM `riwayat_peminjaman` rp
JOIN `peminjaman` p ON rp.id_peminjaman = p.id_peminjaman
JOIN `ruangan` r ON p.id_ruangan = r.id_ruangan
JOIN `gedung` g ON r.id_gedung = g.id_gedung
JOIN `users` u ON p.id_user = u.id_user;

-- =========================
-- TABLE APPROVAL
-- =========================
CREATE TABLE `approval` (
  `id_approval` int(11) NOT NULL,
  `id_peminjaman` int(11) NOT NULL,
  `level` enum('admin_rt','kepala_rt') DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL
) ENGINE=InnoDB;

-- =========================
-- TABLE DISPOSISI
-- =========================
CREATE TABLE `disposisi` (
  `id_disposisi` int(11) NOT NULL,
  `id_peminjaman` int(11) NOT NULL,
  `nomor_surat` varchar(50) DEFAULT NULL,
  `tanggal_cetak` date DEFAULT NULL
) ENGINE=InnoDB;

-- =========================
-- INDEX & CONSTRAINT
-- =========================
ALTER TABLE `gedung` ADD PRIMARY KEY (`id_gedung`);
ALTER TABLE `users` ADD PRIMARY KEY (`id_user`);
ALTER TABLE `ruangan` ADD PRIMARY KEY (`id_ruangan`);
ALTER TABLE `approval` ADD PRIMARY KEY (`id_approval`);
ALTER TABLE `disposisi` ADD PRIMARY KEY (`id_disposisi`);

ALTER TABLE `ruangan`
  ADD CONSTRAINT `fk_ruangan_gedung` FOREIGN KEY (`id_gedung`) REFERENCES `gedung` (`id_gedung`);

ALTER TABLE `peminjaman`
  ADD CONSTRAINT `fk_peminjaman_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`),
  ADD CONSTRAINT `fk_peminjaman_ruangan` FOREIGN KEY (`id_ruangan`) REFERENCES `ruangan` (`id_ruangan`);

ALTER TABLE `riwayat_peminjaman`
  ADD CONSTRAINT `fk_riwayat_peminjaman` FOREIGN KEY (`id_peminjaman`) REFERENCES `peminjaman` (`id_peminjaman`);

ALTER TABLE `approval`
  ADD CONSTRAINT `fk_approval_peminjaman` FOREIGN KEY (`id_peminjaman`) REFERENCES `peminjaman` (`id_peminjaman`);

ALTER TABLE `disposisi`
  ADD CONSTRAINT `fk_disposisi_peminjaman` FOREIGN KEY (`id_peminjaman`) REFERENCES `peminjaman` (`id_peminjaman`);



-- =========================
-- TRIGGER FOR LAPORAN PEMINJAMAN
-- =========================
DELIMITER ;;
CREATE TRIGGER `insert_laporan_peminjaman` AFTER INSERT ON `riwayat_peminjaman`
FOR EACH ROW
BEGIN
  INSERT INTO `laporan_peminjaman` (
    `id_riwayat`,
    `id_peminjaman`,
    `id_user`,
    `id_ruangan`,
    `status_sebelumnya`,
    `status_baru`,
    `keterangan`,
    `tanggal`,
    `jam_mulai`,
    `jam_selesai`,
    `nama_pengguna`,
    `keperluan`,
    `nama_ruangan`,
    `lantai`,
    `nama_gedung`,
    `zona`,
    `nama_user`,
    `role`,
    `locked_at`
  )
  SELECT
    NEW.id_riwayat,
    NEW.id_peminjaman,
    p.id_user,
    p.id_ruangan,
    NEW.status_sebelumnya,
    NEW.status_baru,
    NEW.keterangan,
    p.tanggal,
    p.jam_mulai,
    p.jam_selesai,
    p.nama_pengguna,
    COALESCE(NEW.keperluan, p.keperluan),
    r.nama_ruangan,
    r.lantai,
    g.nama_gedung,
    g.zona,
    u.nama,
    u.role,
    p.locked_at
  FROM `peminjaman` p
  JOIN `ruangan` r ON p.id_ruangan = r.id_ruangan
  JOIN `gedung` g ON r.id_gedung = g.id_gedung
  JOIN `users` u ON p.id_user = u.id_user
  WHERE p.id_peminjaman = NEW.id_peminjaman;
END;;
DELIMITER ;

COMMIT;


