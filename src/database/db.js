import Dexie from 'dexie';

const db = new Dexie('empowerDb');

db.version(3).stores({
    job1: `photoId, uploadStatus`,
    job2: `photoId, uploadStatus`,
    job3: `photoId, uploadStatus`,
    job4: `photoId, uploadStatus`,
    job5: `photoId, uploadStatus`,
    job6: `photoId, uploadStatus`,
    job7: `photoId, uploadStatus`,
    job8: `photoId, uploadStatus`,
    job9: `photoId, uploadStatus`,
    job0: `photoId, uploadStatus`
});

export default db;
