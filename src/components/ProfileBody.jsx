import React from 'react';
import Badge from './Badge.jsx';
import SkillChips from './SkillChips.jsx';
import { labelOf, c2, salaryStr } from '../utils/helpers.js';

export default function ProfileBody({ me }) {
  return (
    <>
      <div className="vbadge-row">
        {me.verified ? (
          <Badge />
        ) : (
          <span className="vpending">
            ⏳ อยู่ระหว่างตรวจสอบตัวตน
            <span className="vt-note"> (กทม.)</span>
          </span>
        )}
      </div>

      {me.skills && me.skills.length > 0 && (
        <div className="block">
          <div className="block-t">ประเภทงานที่ทำได้</div>
          <SkillChips items={me.skills} />
        </div>
      )}

      {me.verified && me.cityNote && (
        <div className="citynote">
          <span className="cn-dot" />
          {me.cityNote}
        </div>
      )}

      {me.story && (
        <div className="block">
          <div className="block-t">รายละเอียดเพิ่มเติม</div>
          <p className="block-p">{me.story}</p>
        </div>
      )}

      <div className="info">
        <div>
          <span className="il">ค่าจ้างที่ต้องการ</span>
          <span className="b-strong">
            {salaryStr(me.salary)}
          </span>
        </div>

        <div>
          <span className="il">ความพร้อม</span>
          <span className={c2(me.availNow)}>
            {me.avail}
          </span>
        </div>

        {me.exp != null && (
          <div>
            <span className="il">ประสบการณ์</span>
            <span>{me.exp} ปี</span>
          </div>
        )}

        <div>
          <span className="il">พื้นที่สะดวกทำงาน</span>
          <span>{me.area}</span>
        </div>

        <div>
          <span className="il">ประเภทงาน</span>
          <span>{labelOf(me.field || me.cat)}</span>
        </div>
      </div>

      {me.roles && me.roles.length > 0 && (
        <div className="block">
          <div className="block-t">งานที่เหมาะกับคุณ</div>

          {me.roles.map((r, i) => (
            <div key={i} className="role">
              <span className="role-t">{r.title}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}